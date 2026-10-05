const Member = require('../models/Member');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/members
 * Register a new member.
 */
const createMember = asyncHandler(async (req, res) => {
  const member = await Member.create(req.body);

  res.status(201).json({
    success: true,
    data: member,
  });
});

/**
 * GET /api/members
 * List members with pagination and name/email search.
 */
const getMembers = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;

  const filter = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: new RegExp(escaped, 'i') },
      { email: new RegExp(escaped, 'i') },
    ];
  }

  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    Member.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Member.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: members,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

module.exports = { createMember, getMembers };
