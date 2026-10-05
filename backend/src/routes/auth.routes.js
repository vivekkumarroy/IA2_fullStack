const router = require('express').Router();
const { login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/auth.schema');

router.post('/login', validate(loginSchema, 'body'), login);

module.exports = router;
