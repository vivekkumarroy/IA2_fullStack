const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/books
 * Add a new book to the catalog.
 */
const createBook = asyncHandler(async (req, res) => {
  const bookData = req.body;

  // Default availableCopies to totalCopies if not provided
  if (bookData.availableCopies === undefined) {
    bookData.availableCopies = bookData.totalCopies;
  }

  const book = await Book.create(bookData);

  res.status(201).json({
    success: true,
    data: book,
  });
});

/**
 * GET /api/books
 * List books with pagination, genre filter, and title search.
 */
const getBooks = asyncHandler(async (req, res) => {
  const { page, limit, genre, search, sort } = req.query;

  // Build filter
  const filter = {};

  if (genre) {
    filter.genre = new RegExp(`^${genre}$`, 'i'); // case-insensitive exact match
  }

  if (search) {
    // Escape regex special characters for safe substring search
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = new RegExp(escaped, 'i');
  }

  const skip = (page - 1) * limit;

  const [books, total] = await Promise.all([
    Book.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Book.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: books,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

/**
 * GET /api/books/genres
 * Get distinct genres for the filter dropdown.
 */
const getGenres = asyncHandler(async (_req, res) => {
  const genres = await Book.distinct('genre');
  genres.sort();

  res.status(200).json({
    success: true,
    data: genres,
  });
});

module.exports = { createBook, getBooks, getGenres };
