const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Set env vars before loading app
process.env.JWT_SECRET = 'test-secret';
process.env.MONGO_URI = 'will-be-overridden';
process.env.NODE_ENV = 'test';
process.env.LOAN_PERIOD_DAYS = '14';
process.env.CORS_ORIGIN = '*';

const app = require('../src/app');
const Book = require('../src/models/Book');
const Member = require('../src/models/Member');
const Librarian = require('../src/models/Librarian');
const BorrowRecord = require('../src/models/BorrowRecord');

let mongoServer;
let token;
let librarianId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create a librarian for auth
  const librarian = await Librarian.create({
    name: 'Test Librarian',
    email: 'test@lib.com',
    passwordHash: 'TestPass1!',
  });
  librarianId = librarian._id;

  // Generate a token
  token = jwt.sign(
    { sub: librarian._id, email: librarian.email, role: 'librarian' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Book.deleteMany({});
  await Member.deleteMany({});
  await BorrowRecord.deleteMany({});
});

describe('Borrow Concurrency Tests', () => {
  it('should allow exactly one issue when 10 parallel requests target a single-copy book', async () => {
    // Create a book with exactly 1 copy
    const book = await Book.create({
      title: 'Rare Book',
      author: 'Author',
      isbn: '9780000000001',
      genre: 'Test',
      totalCopies: 1,
      availableCopies: 1,
    });

    // Create 10 different members
    const members = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        Member.create({
          name: `Member ${i}`,
          email: `member${i}@test.com`,
          membershipId: `MEM-T${String(i).padStart(5, '0')}`,
        })
      )
    );

    // Fire 10 parallel borrow requests
    const results = await Promise.all(
      members.map((member) =>
        request(app)
          .post('/api/borrow')
          .set('Authorization', `Bearer ${token}`)
          .send({ bookId: book._id.toString(), memberId: member._id.toString() })
      )
    );

    const successes = results.filter((r) => r.status === 201);
    const conflicts = results.filter((r) => r.status === 409);

    // Exactly one should succeed
    expect(successes).toHaveLength(1);
    // The other nine should get 409
    expect(conflicts).toHaveLength(9);

    // Verify final state
    const updatedBook = await Book.findById(book._id);
    expect(updatedBook.availableCopies).toBe(0);

    const activeRecords = await BorrowRecord.find({
      book: book._id,
      status: { $in: ['issued', 'overdue'] },
    });
    expect(activeRecords).toHaveLength(1);
  });

  it('should increment stock on return', async () => {
    const book = await Book.create({
      title: 'Return Test Book',
      author: 'Author',
      isbn: '9780000000002',
      genre: 'Test',
      totalCopies: 3,
      availableCopies: 2,
    });

    const member = await Member.create({
      name: 'Return Tester',
      email: 'returner@test.com',
      membershipId: 'MEM-RET01',
    });

    // Issue a book
    const issueRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId: book._id.toString(), memberId: member._id.toString() });

    expect(issueRes.status).toBe(201);

    const borrowId = issueRes.body.data.borrowRecord._id;

    // Return the book
    const returnRes = await request(app)
      .post(`/api/borrow/return/${borrowId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(returnRes.status).toBe(200);
    expect(returnRes.body.data.borrowRecord.status).toBe('returned');

    // Verify stock restored
    const updatedBook = await Book.findById(book._id);
    expect(updatedBook.availableCopies).toBe(2);
  });

  it('should reject double return with 409', async () => {
    const book = await Book.create({
      title: 'Double Return Book',
      author: 'Author',
      isbn: '9780000000003',
      genre: 'Test',
      totalCopies: 2,
      availableCopies: 2,
    });

    const member = await Member.create({
      name: 'Double Returner',
      email: 'double@test.com',
      membershipId: 'MEM-DBL01',
    });

    // Issue
    const issueRes = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId: book._id.toString(), memberId: member._id.toString() });

    const borrowId = issueRes.body.data.borrowRecord._id;

    // First return
    const return1 = await request(app)
      .post(`/api/borrow/return/${borrowId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(return1.status).toBe(200);

    // Second return — should be 409
    const return2 = await request(app)
      .post(`/api/borrow/return/${borrowId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(return2.status).toBe(409);
    expect(return2.body.error.code).toBe('ALREADY_RETURNED');
  });

  it('should reject protected routes without token (401)', async () => {
    const res = await request(app)
      .post('/api/borrow')
      .send({ bookId: '000000000000000000000000', memberId: '000000000000000000000000' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('should return 400 for validation errors', async () => {
    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId: 'invalid', memberId: 'also-invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
  });
});
