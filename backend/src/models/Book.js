const mongoose = require('mongoose');

/**
 * ISBN validator — accepts ISBN-10 or ISBN-13 after stripping hyphens.
 * ISBN-10: 10 digits (last may be X)
 * ISBN-13: 13 digits
 */
function isValidISBN(value) {
  const cleaned = value.replace(/-/g, '');
  if (/^\d{9}[\dXx]$/.test(cleaned)) return true;   // ISBN-10
  if (/^\d{13}$/.test(cleaned)) return true;          // ISBN-13
  return false;
}

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      validate: {
        validator: isValidISBN,
        message: 'Invalid ISBN format. Must be ISBN-10 or ISBN-13.',
      },
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      index: true,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Must have at least 1 copy'],
      validate: {
        validator: Number.isInteger,
        message: 'Total copies must be an integer',
      },
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, 'Available copies cannot be negative'],
      validate: [
        {
          validator: Number.isInteger,
          message: 'Available copies must be an integer',
        },
        {
          validator: function (value) {
            return value <= this.totalCopies;
          },
          message: 'Available copies cannot exceed total copies',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookSchema.index({ title: 'text' });


// Default availableCopies to totalCopies on creation
bookSchema.pre('validate', function (next) {
  if (this.isNew && this.availableCopies == null) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
