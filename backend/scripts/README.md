# Integration Tests

Integration tests for the Moca Gating System Backend API.

## 🧪 Running Tests

### Prerequisites

Make sure the dev server is running:
```bash
npm run dev
```

### Run Tests

```bash
npm run test:integration
```

Or directly:
```bash
npx tsx scripts/test-all.ts
```

## 📋 Test Coverage

The integration test covers:

**Validation:**
- ✅ Invalid email format rejection
- ✅ Invalid wallet format rejection
- ✅ Invalid invite code format rejection

**Admin Endpoints:**
- ✅ Unauthorized access without API key
- ✅ Invite code generation with admin key
- ✅ Statistics endpoint

**Invite Flow:**
- ✅ Code verification
- ✅ Email availability check
- ✅ Successful registration with invite code
- ✅ Code usage decrementing
- ✅ Email marked as used
- ✅ Duplicate email rejection

## 🧹 Clean Database

To reset local database to clean state:
```bash
npm run db:clean
```

This will:
1. Delete `.wrangler/state` directory
2. Re-run migrations

**Note:** Tests use random emails, so cleaning is optional.

## 🔧 Configuration

Set environment variables:
- `API_URL` - API base URL (default: `http://localhost:8787`)
- `ADMIN_API_KEY` - Admin API key (default: from `.dev.vars`)

Example:
```bash
API_URL=http://localhost:8787 npm test
```

## 📊 Output

Colorful test output:
- ✅ Green: Passed tests
- ❌ Red: Failed tests  
- 🔵 Blue: Test sections
- 🔷 Cyan: Info messages
