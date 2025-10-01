# API Documentation

Complete API reference for the Moca Gating System backend.

**Base URL (Local):** `http://localhost:8787`  
**Base URL (Production):** TBD

---

## 📡 Public Endpoints

### 1. Verify Invite Code

Validates an invite code and returns availability.

**Endpoint:**
```http
GET /api/verify-code?code=MOCA-XXXXXXXX
```

**Query Parameters:**
- `code` (required): Invite code in format `MOCA-XXXXXXXX`

**Response (Success):**
```json
{
  "valid": true,
  "usesLeft": 3,
  "codeId": 1
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invite code not found"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing or invalid code parameter

**Example:**
```bash
curl "http://localhost:8787/api/verify-code?code=MOCA-ABC12345"
```

---

### 2. Check Email Availability

Checks if an email address is already registered.

**Endpoint:**
```http
GET /api/check-email?email=user@example.com
```

**Query Parameters:**
- `email` (required): Email address to check

**Response:**
```json
{
  "used": false
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid email format

**Example:**
```bash
curl "http://localhost:8787/api/check-email?email=test@example.com"
```

---

### 3. Check Wallet Availability

Checks if a wallet address is already registered.

**Endpoint:**
```http
GET /api/check-wallet?wallet=0x...
```

**Query Parameters:**
- `wallet` (required): Ethereum wallet address

**Response:**
```json
{
  "used": false
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid wallet address format

**Example:**
```bash
curl "http://localhost:8787/api/check-wallet?wallet=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

---

### 4. Reserve Spot (Registration)

Register for VIP access using NFT or invite code.

**Endpoint:**
```http
POST /api/reserve
```

**Headers:**
```
Content-Type: application/json
```

**Request Body (NFT Path):**
```json
{
  "email": "user@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...",
  "registrationType": "nft"
}
```

**Request Body (Invite Path):**
```json
{
  "email": "user@example.com",
  "inviteCode": "MOCA-ABC12345",
  "registrationType": "invite"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful",
  "registration": {
    "email": "user@example.com",
    "type": "invite",
    "registeredAt": 1704153600000
  }
}
```

**Response (Error):**
```json
{
  "error": "Email already registered",
  "message": "This email has already been used"
}
```

**Status Codes:**
- `201` - Registration successful
- `400` - Validation failed or email/wallet already used
- `403` - Not eligible (NFT not staked long enough)
- `429` - Rate limit exceeded

**Validation Rules:**
- Email must be valid and not already registered
- Wallet must be valid Ethereum address (for NFT path)
- Signature must be valid (for NFT path)
- Invite code must exist and have uses remaining (for invite path)
- NFT must be staked for ≥7 days (for NFT path)

**Example (Invite Path):**
```bash
curl -X POST http://localhost:8787/api/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "inviteCode": "MOCA-ABC12345",
    "registrationType": "invite"
  }'
```

---

## 🔐 Admin Endpoints

All admin endpoints require authentication via `X-API-Key` header.

### 5. Generate Invite Code

Generate a new invite code.

**Endpoint:**
```http
POST /api/admin/generate-code
```

**Headers:**
```
Content-Type: application/json
X-API-Key: your_admin_api_key
```

**Request Body:**
```json
{
  "maxUses": 5,
  "referrerEmail": "admin@example.com"
}
```

**Parameters:**
- `maxUses` (optional): Maximum number of times code can be used (default: 1)
- `referrerEmail` (optional): Email of the person who referred this code

**Response:**
```json
{
  "success": true,
  "code": "MOCA-XYZ98765",
  "maxUses": 5,
  "referrerEmail": "admin@example.com"
}
```

**Status Codes:**
- `201` - Code generated successfully
- `401` - Unauthorized (missing or invalid API key)
- `500` - Server error

**Example:**
```bash
curl -X POST http://localhost:8787/api/admin/generate-code \
  -H "X-API-Key: your_secret_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "maxUses": 3,
    "referrerEmail": "admin@example.com"
  }'
```

---

### 6. Get Statistics

Get system statistics.

**Endpoint:**
```http
GET /api/admin/stats
```

**Headers:**
```
X-API-Key: your_admin_api_key
```

**Response:**
```json
{
  "inviteCodes": {
    "total": 100,
    "active": 45
  },
  "registrations": {
    "total": 250,
    "nft": 150,
    "invite": 100
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

**Example:**
```bash
curl http://localhost:8787/api/admin/stats \
  -H "X-API-Key: your_secret_admin_key_here"
```

---

## 🔒 Security

### Rate Limiting
- **5 requests per hour** per email address
- Applies to `/api/reserve` endpoint
- Uses Cloudflare KV storage with 1-hour TTL
- Returns `429` status when limit exceeded

### Input Validation
- Email: Valid format, normalized (lowercase, trimmed)
- Wallet: Valid Ethereum address (checksummed)
- Invite Code: Format `MOCA-[A-Z2-9]{8}` (excludes confusing chars: 0,O,I,1,l)
- All inputs validated with Zod schemas

### NFT Verification
- Checks on-chain via ethers.js
- Verifies NFT ownership and staking duration
- Results cached in KV for 10 minutes
- Signature verification for wallet ownership

### Admin Authentication
- API key required via `X-API-Key` header
- Set via environment variable `ADMIN_API_KEY`
- All admin endpoints protected

---

## 🧪 Testing

### Using Integration Tests
```bash
cd backend
npm run test:integration
```

### Manual Testing

**1. Health Check:**
```bash
curl http://localhost:8787/
```

**2. Test Invite Flow:**
```bash
# Generate code (admin)
CODE=$(curl -s -X POST http://localhost:8787/api/admin/generate-code \
  -H "X-API-Key: your_secret_admin_key_here" \
  -H "Content-Type: application/json" \
  -d '{"maxUses": 1}' | jq -r '.code')

# Verify code
curl "http://localhost:8787/api/verify-code?code=$CODE"

# Register with code
curl -X POST http://localhost:8787/api/reserve \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"inviteCode\": \"$CODE\",
    \"registrationType\": \"invite\"
  }"
```

---

## 📊 Error Codes

| Code | Meaning | Solution |
|---|---|---|
| `400` | Bad Request | Check request format and parameters |
| `401` | Unauthorized | Provide valid `X-API-Key` header |
| `403` | Forbidden | NFT not eligible (not staked long enough) |
| `404` | Not Found | Endpoint doesn't exist |
| `429` | Too Many Requests | Wait before retrying (rate limit) |
| `500` | Server Error | Contact support or check logs |

---

## 🔄 Response Format

All responses are JSON with consistent structure:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## 📝 Notes

- All timestamps are Unix timestamps (milliseconds)
- Email addresses are case-insensitive and normalized
- Wallet addresses are checksummed
- Invite codes use a charset excluding confusing characters (0,O,I,1,l)
- Database operations are atomic to prevent race conditions

