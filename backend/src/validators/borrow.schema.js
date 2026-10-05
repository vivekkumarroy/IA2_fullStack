const { z } = require('zod');

const issueBookSchema = z.object({
  bookId: z
    .string({ required_error: 'Book ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid book ID format'),
  memberId: z
    .string({ required_error: 'Member ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID format'),
  dueDate: z.coerce.date().optional(),
});

const borrowIdParamSchema = z.object({
  borrowId: z
    .string({ required_error: 'Borrow ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid borrow record ID format'),
});

const historyQuerySchema = z.object({
  status: z.enum(['issued', 'returned', 'overdue']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const memberIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Member ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID format'),
});

module.exports = { issueBookSchema, borrowIdParamSchema, historyQuerySchema, memberIdParamSchema };
