const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
      index: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['issued', 'returned', 'overdue'],
        message: 'Status must be issued, returned, or overdue',
      },
      default: 'issued',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Librarian',
      required: [true, 'IssuedBy (librarian) reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for query performance
borrowRecordSchema.index({ member: 1, issueDate: -1 });
borrowRecordSchema.index({ book: 1, status: 1 });

// Partial unique index: prevent the same member holding two active loans of the same book
borrowRecordSchema.index(
  { book: 1, member: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['issued', 'overdue'] },
    },
  }
);

/**
 * Virtual: effectiveStatus
 * Derives the real-time status: if status is 'issued' and dueDate < now → 'overdue'.
 */
borrowRecordSchema.virtual('effectiveStatus').get(function () {
  if (this.status === 'issued' && this.dueDate < new Date()) {
    return 'overdue';
  }
  return this.status;
});

// Ensure virtuals are included in JSON and object output
borrowRecordSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret) {
    // Also inject effectiveStatus at top level for frontend convenience
    if (ret.status === 'issued' && ret.dueDate && new Date(ret.dueDate) < new Date()) {
      ret.effectiveStatus = 'overdue';
    } else {
      ret.effectiveStatus = ret.status;
    }
    return ret;
  },
});

borrowRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
