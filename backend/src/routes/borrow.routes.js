const router = require('express').Router();
const { issueBook, returnBook, getMemberHistory } = require('../controllers/borrow.controller');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const {
  issueBookSchema,
  borrowIdParamSchema,
  historyQuerySchema,
  memberIdParamSchema,
} = require('../validators/borrow.schema');

// All borrow routes are protected
router.use(protect);

// Issue a book
router.post('/', validate(issueBookSchema, 'body'), issueBook);

// Return a book
router.post(
  '/return/:borrowId',
  validate(borrowIdParamSchema, 'params'),
  returnBook
);

// Member borrow history
router.get(
  '/members/:id/history',
  validate(memberIdParamSchema, 'params'),
  validate(historyQuerySchema, 'query'),
  getMemberHistory
);

module.exports = router;
