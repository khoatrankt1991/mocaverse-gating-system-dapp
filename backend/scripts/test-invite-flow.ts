#!/usr/bin/env node
/**
 * Integration Test: Invite Code Flow
 * 
 * Tests:
 * 1. Generate invite code (admin)
 * 2. Verify invite code
 * 3. Check email availability
 * 4. Reserve with invite code
 * 5. Verify code usage decremented
 * 6. Verify email marked as used
 * 7. Test duplicate email rejection
 */

import {
  log,
  assert,
  assertEqual,
  apiGet,
  apiPost,
  ADMIN_API_KEY,
  generateRandomEmail,
} from './test-helpers';

async function testInviteFlow() {
  log('\n🧪 Testing Invite Code Flow...', 'cyan');
  log('=====================================\n', 'cyan');

  let inviteCode: string;
  const testEmail = generateRandomEmail();

  try {
    // 1. Generate invite code
    log('\n1️⃣  Generating invite code...', 'blue');
    const { response: genRes, data: genData } = await apiPost(
      '/api/admin/generate-code',
      { maxUses: 3, referrerEmail: 'admin@test.com' },
      { 'X-API-Key': ADMIN_API_KEY }
    );
    
    assert(genRes.status === 201, 'Generate code returns 201');
    assert(genData.success === true, 'Generate code success is true');
    assert(genData.code.startsWith('MOCA-'), 'Code has MOCA- prefix');
    assertEqual(genData.maxUses, 3, 'Max uses is 3');
    
    inviteCode = genData.code;
    log(`   Generated code: ${inviteCode}`, 'yellow');

    // 2. Verify invite code
    log('\n2️⃣  Verifying invite code...', 'blue');
    const { data: verifyData } = await apiGet(`/api/verify-code?code=${inviteCode}`);
    
    assert(verifyData.valid === true, 'Code is valid');
    assertEqual(verifyData.usesLeft, 3, 'Uses left is 3');

    // 3. Check email availability
    log('\n3️⃣  Checking email availability...', 'blue');
    const { data: emailData } = await apiGet(`/api/check-email?email=${testEmail}`);
    
    assertEqual(emailData.used, false, 'Email is not used');

    // 4. Reserve with invite code
    log('\n4️⃣  Reserving with invite code...', 'blue');
    const { response: reserveRes, data: reserveData } = await apiPost('/api/reserve', {
      email: testEmail,
      inviteCode: inviteCode,
      registrationType: 'invite',
    });
    
    assert(reserveRes.status === 201, 'Reserve returns 201');
    assert(reserveData.success === true, 'Reserve success is true');
    assertEqual(reserveData.registration.email, testEmail, 'Email matches');
    assertEqual(reserveData.registration.type, 'invite', 'Type is invite');

    // 5. Verify code usage decremented
    log('\n5️⃣  Verifying code usage decremented...', 'blue');
    const { data: verifyData2 } = await apiGet(`/api/verify-code?code=${inviteCode}`);
    
    assertEqual(verifyData2.usesLeft, 2, 'Uses left decremented to 2');

    // 6. Verify email marked as used
    log('\n6️⃣  Verifying email marked as used...', 'blue');
    const { data: emailData2 } = await apiGet(`/api/check-email?email=${testEmail}`);
    
    assertEqual(emailData2.used, true, 'Email is now used');

    // 7. Test duplicate email rejection
    log('\n7️⃣  Testing duplicate email rejection...', 'blue');
    const { response: dupRes, data: dupData } = await apiPost('/api/reserve', {
      email: testEmail,
      inviteCode: inviteCode,
      registrationType: 'invite',
    });
    
    assert(dupRes.status === 400, 'Duplicate email returns 400');
    assert(dupData.error === 'Email already registered', 'Error is correct');

    // Success
    log('\n=====================================', 'cyan');
    log('✨ All Invite Flow Tests Passed! ✨', 'green');
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
testInviteFlow();

