#!/usr/bin/env node
/**
 * Integration Test: Validation Flow
 * 
 * Tests:
 * 1. Invalid email format
 * 2. Invalid wallet address format
 * 3. Invalid invite code format
 * 4. Missing required fields
 * 5. Invalid registration type
 */

import {
  log,
  assert,
  assertEqual,
  apiGet,
  apiPost,
} from './test-helpers';

async function testValidationFlow() {
  log('\n🔍 Testing Validation Flow...', 'cyan');
  log('=====================================\n', 'cyan');

  try {
    // 1. Invalid email format
    log('\n1️⃣  Testing invalid email format...', 'blue');
    const { response: res1, data: data1 } = await apiGet(
      '/api/check-email?email=invalid-email'
    );
    
    assert(res1.status === 400, 'Invalid email returns 400');
    assert(data1.error !== undefined, 'Error message exists');

    // 2. Invalid wallet address format
    log('\n2️⃣  Testing invalid wallet address...', 'blue');
    const { response: res2, data: data2 } = await apiGet(
      '/api/check-wallet?wallet=invalid-wallet'
    );
    
    assert(res2.status === 400, 'Invalid wallet returns 400');
    assertEqual(data2.error, 'Invalid wallet address format', 'Error message is correct');

    // 3. Invalid invite code format
    log('\n3️⃣  Testing invalid invite code format...', 'blue');
    const { data: data3 } = await apiGet('/api/verify-code?code=INVALID-CODE');
    
    assertEqual(data3.valid, false, 'Invalid code format returns valid: false');
    assertEqual(data3.message, 'Invalid code format', 'Message is correct');

    // 4. Missing required fields
    log('\n4️⃣  Testing missing required fields...', 'blue');
    const { response: res4, data: data4 } = await apiPost('/api/reserve', {
      email: 'test@example.com',
      // Missing registrationType
    });
    
    assert(res4.status === 400, 'Missing field returns 400');
    assert(data4.error === 'Validation failed', 'Error is validation failed');

    // 5. Invalid registration type
    log('\n5️⃣  Testing invalid registration type...', 'blue');
    const { response: res5, data: data5 } = await apiPost('/api/reserve', {
      email: 'test@example.com',
      registrationType: 'invalid',
    });
    
    assert(res5.status === 400, 'Invalid type returns 400');
    assert(data5.error === 'Validation failed', 'Error is validation failed');

    // 6. Missing email parameter
    log('\n6️⃣  Testing missing email parameter...', 'blue');
    const { response: res6, data: data6 } = await apiGet('/api/check-email');
    
    assert(res6.status === 400, 'Missing email param returns 400');
    assertEqual(data6.error, 'Missing email parameter', 'Error message is correct');

    // 7. Missing code parameter
    log('\n7️⃣  Testing missing code parameter...', 'blue');
    const { response: res7, data: data7 } = await apiGet('/api/verify-code');
    
    assert(res7.status === 400, 'Missing code param returns 400');
    assertEqual(data7.error, 'Missing code parameter', 'Error message is correct');

    // Success
    log('\n=====================================', 'cyan');
    log('✨ All Validation Tests Passed! ✨', 'green');
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
testValidationFlow();

