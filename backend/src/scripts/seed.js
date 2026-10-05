const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Librarian = require('../models/Librarian');
const BorrowRecord = require('../models/BorrowRecord');
const { addDays } = require('../utils/dates');

const books = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', genre: 'Fiction', totalCopies: 5 },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', genre: 'Fiction', totalCopies: 3 },
  { title: '1984', author: 'George Orwell', isbn: '9780451524935', genre: 'Dystopian', totalCopies: 4 },
  { title: 'Brave New World', author: 'Aldous Huxley', isbn: '9780060850524', genre: 'Dystopian', totalCopies: 2 },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', genre: 'Fiction', totalCopies: 1 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', genre: 'Romance', totalCopies: 4 },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', genre: 'Fantasy', totalCopies: 6 },
  { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', isbn: '9780747532699', genre: 'Fantasy', totalCopies: 8 },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '9780618640157', genre: 'Fantasy', totalCopies: 3 },
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', genre: 'Science Fiction', totalCopies: 4 },
  { title: 'Foundation', author: 'Isaac Asimov', isbn: '9780553293357', genre: 'Science Fiction', totalCopies: 3 },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', genre: 'Science Fiction', totalCopies: 2 },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', genre: 'Non-Fiction', totalCopies: 3 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', genre: 'Non-Fiction', totalCopies: 5 },
  { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', genre: 'Non-Fiction', totalCopies: 4 },
  { title: 'The Art of War', author: 'Sun Tzu', isbn: '9781599869773', genre: 'Philosophy', totalCopies: 3 },
  { title: 'Meditations', author: 'Marcus Aurelius', isbn: '9780140449334', genre: 'Philosophy', totalCopies: 2 },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', isbn: '9780486415871', genre: 'Classic', totalCopies: 3 },
  { title: 'War and Peace', author: 'Leo Tolstoy', isbn: '9781400079988', genre: 'Classic', totalCopies: 2 },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780061122415', genre: 'Fiction', totalCopies: 5 },
  { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '9780307588371', genre: 'Thriller', totalCopies: 4 },
  { title: 'The Da Vinci Code', author: 'Dan Brown', isbn: '9780307474278', genre: 'Thriller', totalCopies: 3 },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', genre: 'Self-Help', totalCopies: 6 },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', genre: 'Psychology', totalCopies: 3 },
  { title: 'The Silent Patient', author: 'Alex Michaelides', isbn: '9781250301697', genre: 'Thriller', totalCopies: 1 },
];

const members = [
  { name: 'Alice Johnson', email: 'alice@example.com', membershipId: 'MEM-A00001' },
  { name: 'Bob Smith', email: 'bob@example.com', membershipId: 'MEM-B00002' },
  { name: 'Carol Williams', email: 'carol@example.com', membershipId: 'MEM-C00003' },
  { name: 'David Brown', email: 'david@example.com', membershipId: 'MEM-D00004' },
  { name: 'Eve Davis', email: 'eve@example.com', membershipId: 'MEM-E00005' },
  { name: 'Frank Miller', email: 'frank@example.com', membershipId: 'MEM-F00006' },
  { name: 'Grace Wilson', email: 'grace@example.com', membershipId: 'MEM-G00007' },
  { name: 'Henry Taylor', email: 'henry@example.com', membershipId: 'MEM-H00008' },
];

async function seed({ disconnect = true } = {}) {
  try {
    await connectDB();
    console.log('🌱 Seeding database...\n');

    // Clear existing data
    await Promise.all([
      Book.deleteMany({}),
      Member.deleteMany({}),
      Librarian.deleteMany({}),
      BorrowRecord.deleteMany({}),
    ]);
    console.log('   Cleared existing data.');

    // Create librarian
    const librarian = await Librarian.create({
      name: 'Admin Librarian',
      email: 'librarian@shelflife.test',
      passwordHash: 'Passw0rd!', // will be hashed by pre-save hook
    });
    console.log(`   ✅ Librarian: ${librarian.email} / Passw0rd!`);

    // Create books
    const createdBooks = await Book.insertMany(
      books.map((b) => ({ ...b, availableCopies: b.totalCopies }))
    );
    console.log(`   ✅ ${createdBooks.length} books created across ${[...new Set(books.map(b => b.genre))].length} genres`);

    // Create members
    const createdMembers = await Member.insertMany(members);
    console.log(`   ✅ ${createdMembers.length} members created`);

    // Create borrow records
    const now = new Date();
    const borrowRecords = [];

    // Active loan (not overdue)
    borrowRecords.push({
      book: createdBooks[0]._id,   // Great Gatsby
      member: createdMembers[0]._id, // Alice
      issueDate: addDays(now, -3),
      dueDate: addDays(now, 11),
      issuedBy: librarian._id,
      status: 'issued',
    });

    // Overdue loan 1 (issued 30 days ago, due 16 days ago)
    borrowRecords.push({
      book: createdBooks[2]._id,   // 1984
      member: createdMembers[1]._id, // Bob
      issueDate: addDays(now, -30),
      dueDate: addDays(now, -16),
      issuedBy: librarian._id,
      status: 'issued', // will be detected as overdue via effectiveStatus
    });

    // Overdue loan 2 (issued 25 days ago, due 11 days ago)
    borrowRecords.push({
      book: createdBooks[6]._id,   // The Hobbit
      member: createdMembers[2]._id, // Carol
      issueDate: addDays(now, -25),
      dueDate: addDays(now, -11),
      issuedBy: librarian._id,
      status: 'issued',
    });

    // Returned loan (on time)
    borrowRecords.push({
      book: createdBooks[3]._id,   // Brave New World
      member: createdMembers[0]._id, // Alice
      issueDate: addDays(now, -20),
      dueDate: addDays(now, -6),
      returnDate: addDays(now, -8),
      issuedBy: librarian._id,
      status: 'returned',
    });

    // Returned loan (late)
    borrowRecords.push({
      book: createdBooks[7]._id,   // Harry Potter
      member: createdMembers[3]._id, // David
      issueDate: addDays(now, -30),
      dueDate: addDays(now, -16),
      returnDate: addDays(now, -10),
      issuedBy: librarian._id,
      status: 'returned',
    });

    // Active loan for member with history
    borrowRecords.push({
      book: createdBooks[9]._id,   // Dune
      member: createdMembers[0]._id, // Alice — has multiple records
      issueDate: addDays(now, -5),
      dueDate: addDays(now, 9),
      issuedBy: librarian._id,
      status: 'issued',
    });

    const createdRecords = await BorrowRecord.insertMany(borrowRecords);

    // Decrement available copies for active/overdue loans
    for (const record of createdRecords) {
      if (record.status !== 'returned') {
        await Book.updateOne(
          { _id: record.book },
          { $inc: { availableCopies: -1 } }
        );
      }
    }

    console.log(`   ✅ ${createdRecords.length} borrow records (2 overdue, 2 returned, 2 active)`);

    console.log('\n🎉 Seed complete!\n');
    console.log('   Login credentials:');
    console.log('   Email:    librarian@shelflife.test');
    console.log('   Password: Passw0rd!\n');

    if (disconnect) {
      await mongoose.connection.close();
    }
  } catch (err) {
    console.error('❌ Seed error:', err);
    if (disconnect) {
      await mongoose.connection.close();
    }
    throw err;
  }
}

if (require.main === module) {
  seed().catch(() => {
    process.exitCode = 1;
  });
}

module.exports = { seed };
