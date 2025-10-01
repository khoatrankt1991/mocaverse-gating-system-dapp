#!/usr/bin/env node
/**
 * Integration Tests for Moca Gating System Backend
 * Run: npx tsx scripts/integration-test.ts
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8787';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your_secret_admin_key_here';

// Types
interface ApiResponse { response: Response; data: any }

// Helper functions
const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', blue: '\x1b[34m', cyan: '\x1b[36m' };
const log = (msg: string, color: keyof typeof colors = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(`❌ ${message}`);
  log(`✅ ${message}`, 'green');
};

async function apiGet(path: string, headers = {}): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...headers } });
  return { response: res, data: await res.json() };
}

async function apiPost(path: string, body: any, headers = {}): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return { response: res, data: await res.json() };
}

const randomEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

async function runTests() {
  log('\n🚀 Running Integration Tests...', 'cyan');
  log('=====================================\n', 'cyan');

  try {
    // 1. VALIDATION TESTS
    log('\n1️⃣  Validation Tests', 'blue');
    const { response: r1 } = await apiGet('/api/check-email?email=invalid');
    assert(r1.status === 400, 'Invalid email format rejected');
    
    const { response: r2 } = await apiGet('/api/check-wallet?wallet=invalid');
    assert(r2.status === 400, 'Invalid wallet format rejected');
    
    const { data: d1 } = await apiGet('/api/verify-code?code=INVALID');
    assert(d1.valid === false, 'Invalid code format rejected');

    // 2. ADMIN TESTS
    log('\n2️⃣  Admin Tests', 'blue');
    const { response: r3 } = await apiPost('/api/admin/generate-code', { maxUses: 1 });
    assert(r3.status === 401, 'No API key returns 401');
    
    const { response: r4, data: d2 } = await apiPost(
      '/api/admin/generate-code',
      { maxUses: 3, referrerEmail: 'admin@test.com' },
      { 'X-API-Key': ADMIN_API_KEY }
    );
    assert(r4.status === 201 && d2.success, 'Admin generates code successfully');
    const inviteCode = d2.code;
    log(`   Generated: ${inviteCode}`, 'cyan');
    
    const { data: d3 } = await apiGet('/api/admin/stats', { 'X-API-Key': ADMIN_API_KEY });
    assert(d3.inviteCodes !== undefined, 'Stats endpoint works');

    // 3. INVITE FLOW TESTS
    log('\n3️⃣  Invite Flow Tests', 'blue');
    const { data: d4 } = await apiGet(`/api/verify-code?code=${inviteCode}`);
    assert(d4.valid && d4.usesLeft === 3, 'Code is valid with 3 uses');
    
    const email = randomEmail();
    const { data: d5 } = await apiGet(`/api/check-email?email=${email}`);
    assert(d5.used === false, 'Email is available');
    
    const { response: r5, data: d6 } = await apiPost('/api/reserve', {
      email,
      inviteCode,
      registrationType: 'invite',
    });
    assert(r5.status === 201 && d6.success, 'Registration successful');
    
    const { data: d7 } = await apiGet(`/api/verify-code?code=${inviteCode}`);
    assert(d7.usesLeft === 2, 'Code usage decremented');
    
    const { data: d8 } = await apiGet(`/api/check-email?email=${email}`);
    assert(d8.used === true, 'Email marked as used');
    
    const { response: r6 } = await apiPost('/api/reserve', {
      email,
      inviteCode,
      registrationType: 'invite',
    });
    assert(r6.status === 400, 'Duplicate email rejected');

    // SUCCESS
    log('\n=====================================', 'cyan');
    log('✨ All Tests Passed! ✨', 'green');
    log('=====================================\n', 'cyan');
    
  } catch (error) {
    log('\n❌ Test Failed!', 'red');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

runTests();

