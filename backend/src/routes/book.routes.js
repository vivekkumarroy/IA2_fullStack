const router = require('express').Router();
const { createBook, getBooks, getGenres } = require('../controllers/book.controller');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const { createBookSchema, bookQuerySchema } = require('../validators/book.schema');

// Public routes
router.get('/genres', getGenres);
router.get('/', validate(bookQuerySchema, 'query'), getBooks);

// Protected routes
router.post('/', protect, validate(createBookSchema, 'body'), createBook);

module.exports = router;
