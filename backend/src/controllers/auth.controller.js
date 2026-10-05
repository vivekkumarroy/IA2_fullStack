const jwt = require('jsonwebtoken');
const Librarian = require('../models/Librarian');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/**
 * POST /api/auth/login
 * Authenticate a librarian and issue a JWT.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find librarian with passwordHash explicitly selected
  const librarian = await Librarian.findOne({ email }).select('+passwordHash');

  if (!librarian) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const isMatch = await librarian.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Generate JWT
  const payload = {
    sub: librarian._id,
    email: librarian.email,
    role: librarian.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.status(200).json({
    success: true,
    data: {
      token,
      librarian: {
        id: librarian._id,
        name: librarian.name,
        email: librarian.email,
      },
    },
  });
});

module.exports = { login };
