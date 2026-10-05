#!/usr/bin/env bash
# ==============================================================================
# ShelfLife API Walkthrough Script (curl)
# Tests all endpoints sequentially against http://localhost:5000/api
# ==============================================================================

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 1. Health Check (GET /api/health) ===${NC}"
curl -s -X GET "$BASE_URL/health" | jq .
echo -e "\n"

echo -e "${BLUE}=== 2. Librarian Login (POST /api/auth/login) ===${NC}"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "librarian@shelflife.test", "password": "Passw0rd!"}')
echo "$LOGIN_RES" | jq .

TOKEN=$(echo "$LOGIN_RES" | jq -r '.data.token')
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to authenticate. Ensure the backend is running and seeded.${NC}"
  exit 1
fi
echo -e "${GREEN}Captured JWT Token!${NC}\n"

echo -e "${BLUE}=== 3. Distinct Genres (GET /api/books/genres) ===${NC}"
curl -s -X GET "$BASE_URL/books/genres" | jq .
echo -e "\n"

echo -e "${BLUE}=== 4. List Books (GET /api/books?page=1&limit=5) ===${NC}"
BOOKS_RES=$(curl -s -X GET "$BASE_URL/books?page=1&limit=5")
echo "$BOOKS_RES" | jq .
BOOK_ID=$(echo "$BOOKS_RES" | jq -r '.data[0]._id')
echo -e "Selected Book ID: $BOOK_ID\n"

echo -e "${BLUE}=== 5. Filter Books by Genre & Search (GET /api/books?genre=Fiction&search=Great) ===${NC}"
curl -s -X GET "$BASE_URL/books?genre=Fiction&search=Great" | jq .
echo -e "\n"

echo -e "${BLUE}=== 6. Create a New Book (POST /api/books) ===${NC}"
NEW_BOOK_RES=$(curl -s -X POST "$BASE_URL/books" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Clean Architecture",
    "author": "Robert C. Martin",
    "isbn": "9780134494166",
    "genre": "Software Engineering",
    "totalCopies": 2,
    "availableCopies": 2
  }')
echo "$NEW_BOOK_RES" | jq .
NEW_BOOK_ID=$(echo "$NEW_BOOK_RES" | jq -r '.data._id')
echo -e "Created Book ID: $NEW_BOOK_ID\n"

echo -e "${BLUE}=== 7. List Members (GET /api/members?page=1&limit=5) ===${NC}"
MEMBERS_RES=$(curl -s -X GET "$BASE_URL/members?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")
echo "$MEMBERS_RES" | jq .
MEMBER_ID=$(echo "$MEMBERS_RES" | jq -r '.data[0]._id')
echo -e "Selected Member ID: $MEMBER_ID\n"

echo -e "${BLUE}=== 8. Register a New Member (POST /api/members) ===${NC}"
RANDOM_NUM=$((1000 + RANDOM % 9000))
NEW_MEMBER_RES=$(curl -s -X POST "$BASE_URL/members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Demo Student $RANDOM_NUM\",
    \"email\": \"student$RANDOM_NUM@university.edu\"
  }")
echo "$NEW_MEMBER_RES" | jq .
NEW_MEMBER_ID=$(echo "$NEW_MEMBER_RES" | jq -r '.data._id')
echo -e "Created Member ID: $NEW_MEMBER_ID\n"

echo -e "${BLUE}=== 9. Issue a Book (POST /api/borrow) ===${NC}"
BORROW_RES=$(curl -s -X POST "$BASE_URL/borrow" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"bookId\": \"$NEW_BOOK_ID\",
    \"memberId\": \"$NEW_MEMBER_ID\"
  }")
echo "$BORROW_RES" | jq .
BORROW_ID=$(echo "$BORROW_RES" | jq -r '.data.borrowRecord._id')
echo -e "Created Borrow Record ID: $BORROW_ID\n"

echo -e "${BLUE}=== 10. Issue Again: Duplicate Active Loan check (POST /api/borrow) ===${NC}"
echo "Attempting to issue the same book to the same member (expecting 409 ALREADY_BORROWED)..."
curl -s -X POST "$BASE_URL/borrow" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"bookId\": \"$NEW_BOOK_ID\",
    \"memberId\": \"$NEW_MEMBER_ID\"
  }" | jq .
echo -e "\n"

echo -e "${BLUE}=== 11. Member Borrow History (GET /api/members/:id/history) ===${NC}"
curl -s -X GET "$BASE_URL/members/$NEW_MEMBER_ID/history" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo -e "${BLUE}=== 12. Return the Book (POST /api/return/:borrowId) ===${NC}"
RETURN_RES=$(curl -s -X POST "$BASE_URL/return/$BORROW_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "$RETURN_RES" | jq .
echo -e "\n"

echo -e "${BLUE}=== 13. Double Return: idempotency/race safety check (POST /api/return/:borrowId) ===${NC}"
echo "Attempting to return already returned book (expecting 409 ALREADY_RETURNED)..."
curl -s -X POST "$BASE_URL/return/$BORROW_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

echo -e "${BLUE}=== 14. Issue Book when 0 Copies Available (Failure Demo) ===${NC}"
# Create 1-copy book, issue it, then attempt to issue again
TEMP_BOOK_RES=$(curl -s -X POST "$BASE_URL/books" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Scarce Manuscript",
    "author": "Rare Collector",
    "isbn": "9780000009999",
    "genre": "Rare",
    "totalCopies": 1
  }')
TEMP_BOOK_ID=$(echo "$TEMP_BOOK_RES" | jq -r '.data._id')

# First borrow takes the only copy
curl -s -X POST "$BASE_URL/borrow" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"bookId\": \"$TEMP_BOOK_ID\", \"memberId\": \"$MEMBER_ID\"}" > /dev/null

# Second borrow by another member should fail with 409 NO_COPIES_AVAILABLE
echo "Attempting second borrow for 0-copy book (expecting 409 NO_COPIES_AVAILABLE)..."
curl -s -X POST "$BASE_URL/borrow" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"bookId\": \"$TEMP_BOOK_ID\", \"memberId\": \"$NEW_MEMBER_ID\"}" | jq .
echo -e "\n"

echo -e "${GREEN}=== All endpoints exercised successfully! ===${NC}"
