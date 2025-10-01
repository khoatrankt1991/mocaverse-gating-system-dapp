/**
 * Integration Test Helpers
 */

export const BASE_URL = process.env.API_URL || 'http://localhost:8787';
export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your_secret_admin_key_here';

// Types
export interface ApiResponse {
  response: Response;
  data: any;
}

// Colors for console output
export const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

export function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

export function assert(condition: boolean, message: string) {
  if (!condition) {
    log(`❌ FAILED: ${message}`, 'red');
    throw new Error(message);
  }
  log(`✅ PASSED: ${message}`, 'green');
}

export function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    log(`❌ FAILED: ${message}`, 'red');
    log(`   Expected: ${JSON.stringify(expected)}`, 'yellow');
    log(`   Actual:   ${JSON.stringify(actual)}`, 'yellow');
    throw new Error(message);
  }
  log(`✅ PASSED: ${message}`, 'green');
}

export async function apiGet(path: string, headers: Record<string, string> = {}): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  const data = await response.json();
  return { response, data };
}

export async function apiPost(
  path: string,
  body: any,
  headers: Record<string, string> = {}
): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { response, data };
}

export function generateRandomEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

