const router = require('express').Router();
const { createMember, getMembers } = require('../controllers/member.controller');
const { getMemberHistory } = require('../controllers/borrow.controller');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const { createMemberSchema, memberQuerySchema } = require('../validators/member.schema');
const { historyQuerySchema, memberIdParamSchema } = require('../validators/borrow.schema');

// All member routes are protected
router.use(protect);

router.get('/', validate(memberQuerySchema, 'query'), getMembers);
router.post('/', validate(createMemberSchema, 'body'), createMember);

// GET /api/members/:id/history
router.get(
  '/:id/history',
  validate(memberIdParamSchema, 'params'),
  validate(historyQuerySchema, 'query'),
  getMemberHistory
);

module.exports = router;

