const Book = require('../models/Book');
const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { addDays } = require('../utils/dates');
const { LOAN_PERIOD_DAYS } = require('../config/env');

/*
 * ──────────────────────────────────────────────────────────────────────────────
 * RACE CONDITION EXPLANATION (Q1e)
 * ──────────────────────────────────────────────────────────────────────────────
 * Two librarians clicking "issue" on the last copy at the same moment could
 * both read `availableCopies = 1`, both pass an `if (> 0)` check, and both
 * decrement, giving -1 and two loans for one copy. A read-then-write is not
 * atomic. To prevent it, I make the check and the decrement a single database
 * operation: `findOneAndUpdate({ _id, availableCopies: { $gt: 0 } },
 * { $inc: { availableCopies: -1 } })`. MongoDB applies single-document updates
 * atomically, so exactly one request matches the filter and gets the document
 * back; the other gets `null` and is answered with 409 "no copies available".
 * If creating the BorrowRecord fails afterwards, the controller increments
 * the counter back (compensation), or the whole flow runs in a transaction on
 * a replica set. A `min: 0` schema validator and a unique partial index on
 * active loans act as additional safety nets.
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * POST /api/borrow
 * Issue a book to a member using atomic conditional update.
 */
const issueBook = asyncHandler(async (req, res) => {
  const { bookId, memberId, dueDate } = req.body;

  // 1. Confirm the member exists
  const memberExists = await Member.findById(memberId);
  if (!memberExists) {
    throw new ApiError(404, 'MEMBER_NOT_FOUND', 'Member not found');
  }

  // 2. Atomically reserve a copy
  const book = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { new: true }
  );

  // 3. If null, determine why
  if (!book) {
    const bookExists = await Book.exists({ _id: bookId });
    if (!bookExists) {
      throw new ApiError(404, 'BOOK_NOT_FOUND', 'Book not found');
    }
    throw new ApiError(409, 'NO_COPIES_AVAILABLE', 'No copies available for this book');
  }

  // 4. Create the BorrowRecord
  const issueDate = new Date();
  const computedDueDate = dueDate
    ? new Date(dueDate)
    : addDays(issueDate, LOAN_PERIOD_DAYS);

  let borrowRecord;
  try {
    borrowRecord = await BorrowRecord.create({
      book: bookId,
      member: memberId,
      issueDate,
      dueDate: computedDueDate,
      issuedBy: req.user.sub,
    });
  } catch (err) {
    // 5. Compensation: roll back the decrement
    await Book.updateOne(
      { _id: bookId },
      { $inc: { availableCopies: 1 } }
    );

    // Check if it's a duplicate active loan
    if (err.code === 11000) {
      throw new ApiError(
        409,
        'ALREADY_BORROWED',
        'This member already has an active loan for this book'
      );
    }

    throw err; // rethrow other errors
  }

  // Populate for response
  const populated = await BorrowRecord.findById(borrowRecord._id)
    .populate('book', 'title author isbn genre totalCopies availableCopies')
    .populate('member', 'name email membershipId');

  res.status(201).json({
    success: true,
    data: {
      borrowRecord: populated,
      availableCopies: book.availableCopies, // already decremented (new: true)
    },
  });
});

/**
 * POST /api/return/:borrowId
 * Return a borrowed book using atomic conditional update.
 */
const returnBook = asyncHandler(async (req, res) => {
  const { borrowId } = req.params;

  // Atomically claim the return so double-submits can't double-increment
  const record = await BorrowRecord.findOneAndUpdate(
    { _id: borrowId, status: { $in: ['issued', 'overdue'] } },
    { $set: { returnDate: new Date(), status: 'returned' } },
    { new: true }
  );

  if (!record) {
    const exists = await BorrowRecord.exists({ _id: borrowId });
    if (!exists) {
      throw new ApiError(404, 'BORROW_NOT_FOUND', 'Borrow record not found');
    }
    throw new ApiError(409, 'ALREADY_RETURNED', 'This book has already been returned');
  }

  // Increment available copies (guard prevents exceeding total)
  await Book.updateOne(
    {
      _id: record.book,
      $expr: { $lt: ['$availableCopies', '$totalCopies'] },
    },
    { $inc: { availableCopies: 1 } }
  );

  // Populate for response
  const populated = await BorrowRecord.findById(record._id)
    .populate('book', 'title author isbn genre totalCopies availableCopies')
    .populate('member', 'name email membershipId');

  const wasLate = record.returnDate > record.dueDate;

  res.status(200).json({
    success: true,
    data: {
      borrowRecord: populated,
      wasLate,
    },
  });
});

/**
 * GET /api/members/:id/history
 * Get a member's borrow history with optional status filter.
 */
const getMemberHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, page, limit } = req.query;

  // Check member exists
  const member = await Member.findById(id).lean();
  if (!member) {
    throw new ApiError(404, 'MEMBER_NOT_FOUND', 'Member not found');
  }

  // Lightweight update: flip issued → overdue where dueDate < now
  await BorrowRecord.updateMany(
    { member: id, status: 'issued', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );

  // Build filter
  const filter = { member: id };
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    BorrowRecord.find(filter)
      .sort('-issueDate')
      .skip(skip)
      .limit(limit)
      .populate('book', 'title author isbn genre')
      .lean({ virtuals: true }),
    BorrowRecord.countDocuments(filter),
  ]);

  // Add effectiveStatus to each record
  const now = new Date();
  const enriched = records.map((r) => ({
    ...r,
    effectiveStatus:
      r.status === 'issued' && r.dueDate < now ? 'overdue' : r.status,
  }));

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: enriched,
    meta: {
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
        membershipId: member.membershipId,
      },
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

module.exports = { issueBook, returnBook, getMemberHistory };
