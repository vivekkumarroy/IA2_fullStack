const { z } = require('zod');

/**
 * ISBN validation: accepts ISBN-10 or ISBN-13 after stripping hyphens.
 */
const isbnSchema = z
  .string({ required_error: 'ISBN is required' })
  .trim()
  .refine(
    (val) => {
      const cleaned = val.replace(/-/g, '');
      return /^\d{9}[\dXx]$/.test(cleaned) || /^\d{13}$/.test(cleaned);
    },
    { message: 'Invalid ISBN format. Must be ISBN-10 or ISBN-13.' }
  );

const createBookSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title must be at least 1 character')
      .max(200, 'Title must be at most 200 characters'),
    author: z
      .string({ required_error: 'Author is required' })
      .trim()
      .min(1, 'Author is required'),
    isbn: isbnSchema,
    genre: z
      .string({ required_error: 'Genre is required' })
      .trim()
      .min(1, 'Genre is required'),
    totalCopies: z
      .number({ required_error: 'Total copies is required' })
      .int('Total copies must be an integer')
      .min(1, 'Must have at least 1 copy'),
    availableCopies: z
      .number()
      .int('Available copies must be an integer')
      .min(0, 'Available copies cannot be negative')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.availableCopies !== undefined) {
        return data.availableCopies <= data.totalCopies;
      }
      return true;
    },
    {
      message: 'Available copies cannot exceed total copies',
      path: ['availableCopies'],
    }
  );

const bookQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  genre: z.string().trim().optional(),
  search: z.string().trim().optional(),
  sort: z.string().trim().default('-createdAt'),
});

module.exports = { createBookSchema, bookQuerySchema };
