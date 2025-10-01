#!/usr/bin/env node
/**
 * Integration Test: Admin Flow
 * 
 * Tests:
 * 1. Generate invite code (admin)
 * 2. Unauthorized access without API key
 * 3. Wrong API key rejection
 * 4. Get statistics
 * 5. Multiple code generation
 */

import {
  log,
  assert,
  assertEqual,
  apiGet,
  apiPost,
  ADMIN_API_KEY,
} from './test-helpers';

async function testAdminFlow() {
  log('\n🔐 Testing Admin Flow...', 'cyan');
  log('=====================================\n', 'cyan');

  try {
    // 1. Generate invite code with admin key
    log('\n1️⃣  Generating invite code with admin key...', 'blue');
    const { response: res1, data: data1 } = await apiPost(
      '/api/admin/generate-code',
      { maxUses: 5, referrerEmail: 'admin@example.com' },
      { 'X-API-Key': ADMIN_API_KEY }
    );
    
    assert(res1.status === 201, 'Admin generate returns 201');
    assert(data1.success === true, 'Success is true');
    assert(data1.code.startsWith('MOCA-'), 'Code format is correct');
    assertEqual(data1.maxUses, 5, 'Max uses is 5');
    log(`   Generated: ${data1.code}`, 'yellow');

    // 2. Unauthorized access without API key
    log('\n2️⃣  Testing unauthorized access...', 'blue');
    const { response: res2, data: data2 } = await apiPost(
      '/api/admin/generate-code',
      { maxUses: 1 }
    );
    
    assert(res2.status === 401, 'No API key returns 401');
    assertEqual(data2.error, 'Unauthorized', 'Error is Unauthorized');

    // 3. Wrong API key rejection
    log('\n3️⃣  Testing wrong API key...', 'blue');
    const { response: res3, data: data3 } = await apiPost(
      '/api/admin/generate-code',
      { maxUses: 1 },
      { 'X-API-Key': 'wrong-key' }
    );
    
    assert(res3.status === 401, 'Wrong API key returns 401');
    assertEqual(data3.error, 'Unauthorized', 'Error is Unauthorized');

    // 4. Get statistics
    log('\n4️⃣  Getting statistics...', 'blue');
    const { response: res4, data: data4 } = await apiGet('/api/admin/stats', {
      'X-API-Key': ADMIN_API_KEY,
    });
    
    assert(res4.status === 200, 'Stats returns 200');
    assert(data4.inviteCodes !== undefined, 'Invite codes stats exist');
    assert(data4.registrations !== undefined, 'Registrations stats exist');
    assert(typeof data4.inviteCodes.total === 'number', 'Total codes is number');
    assert(typeof data4.registrations.total === 'number', 'Total registrations is number');
    log(`   Total codes: ${data4.inviteCodes.total}`, 'yellow');
    log(`   Total registrations: ${data4.registrations.total}`, 'yellow');

    // 5. Multiple code generation
    log('\n5️⃣  Generating multiple codes...', 'blue');
    const codes: string[] = [];
    for (let i = 0; i < 3; i++) {
      const { data } = await apiPost(
        '/api/admin/generate-code',
        { maxUses: 1 },
        { 'X-API-Key': ADMIN_API_KEY }
      );
      codes.push(data.code);
    }
    
    assert(codes.length === 3, 'Generated 3 codes');
    const uniqueCodes = new Set(codes);
    assert(uniqueCodes.size === 3, 'All codes are unique');
    log(`   Generated unique codes: ${codes.join(', ')}`, 'yellow');

    // Success
    log('\n=====================================', 'cyan');
    log('✨ All Admin Flow Tests Passed! ✨', 'green');
    log('=====================================\n', 'cyan');
    
  } catch (error) {
    log('\n❌ Test Failed!', 'red');
    if (error instanceof Error) {
      log(error.message, 'red');
    }
    process.exit(1);
  }
}

// Run tests
testAdminFlow();

