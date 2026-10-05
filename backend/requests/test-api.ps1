# ==============================================================================
# ShelfLife API Test Script (PowerShell)
# Tests all endpoints sequentially against http://localhost:5000/api
# ==============================================================================

$baseUrl = "http://localhost:5000/api"

Write-Host "=== 1. Health Check (GET /api/health) ===" -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
$health | ConvertTo-Json

Write-Host "`n=== 2. Librarian Login (POST /api/auth/login) ===" -ForegroundColor Cyan
$loginBody = @{
    email = "librarian@shelflife.test"
    password = "Passw0rd!"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$loginRes | ConvertTo-Json
$token = $loginRes.data.token

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n=== 3. Distinct Genres (GET /api/books/genres) ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/books/genres" -Method Get | ConvertTo-Json

Write-Host "`n=== 4. List Books (GET /api/books?page=1&limit=3) ===" -ForegroundColor Cyan
$books = Invoke-RestMethod -Uri "$baseUrl/books?page=1&limit=3" -Method Get
$books | ConvertTo-Json
$bookId = $books.data[0]._id

Write-Host "`n=== 5. List Members (GET /api/members?page=1&limit=3) ===" -ForegroundColor Cyan
$members = Invoke-RestMethod -Uri "$baseUrl/members?page=1&limit=3" -Method Get -Headers $headers
$members | ConvertTo-Json
$memberId = $members.data[0]._id

Write-Host "`n=== 6. Issue Book (POST /api/borrow) ===" -ForegroundColor Cyan
$borrowBody = @{
    bookId = $bookId
    memberId = $memberId
} | ConvertTo-Json

try {
    $borrowRes = Invoke-RestMethod -Uri "$baseUrl/borrow" -Method Post -Headers $headers -Body $borrowBody
    $borrowRes | ConvertTo-Json
    $borrowId = $borrowRes.data.borrowRecord._id

    Write-Host "`n=== 7. Return Book (POST /api/return/:borrowId) ===" -ForegroundColor Cyan
    $returnRes = Invoke-RestMethod -Uri "$baseUrl/return/$borrowId" -Method Post -Headers $headers
    $returnRes | ConvertTo-Json
} catch {
    Write-Host "Note: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== 8. Member Borrow History (GET /api/members/:id/history) ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/members/$memberId/history" -Method Get -Headers $headers | ConvertTo-Json

Write-Host "`n=== All API Tests Finished! ===" -ForegroundColor Green
