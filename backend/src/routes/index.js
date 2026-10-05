const router = require('express').Router();

const authRoutes = require('./auth.routes');
const bookRoutes = require('./book.routes');
const memberRoutes = require('./member.routes');
const borrowRoutes = require('./borrow.routes');
const { returnBook } = require('../controllers/borrow.controller');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const { borrowIdParamSchema } = require('../validators/borrow.schema');

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

// POST /api/return/:borrowId (PRD endpoint #7)
router.post(
  '/return/:borrowId',
  protect,
  validate(borrowIdParamSchema, 'params'),
  returnBook
);

// Mount route modules
router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/members', memberRoutes);
router.use('/borrow', borrowRoutes);

module.exports = router;

