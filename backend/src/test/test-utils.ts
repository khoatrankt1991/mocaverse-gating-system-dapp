import { Hono } from 'hono'
import type { Env } from '../types'

// Mock environment for testing
export const createMockEnv = (overrides: Partial<Env> = {}): Env => ({
  DB: {} as any,
  API_KEY: 'test-api-key',
  NFT_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  ALCHEMY_KEY: 'test-alchemy-key',
  RATE_LIMIT_KV: {} as any,
  ...overrides,
})

// Helper to create a test request
export const createTestRequest = (
  url: string,
  options: RequestInit = {}
): Request => {
  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `http://localhost${url}`
  return new Request(fullUrl, {
    method: 'GET',
    ...options,
  })
}

// Helper to create a test context
export const createTestContext = (
  request: Request,
  env: Env = createMockEnv()
) => {
  return {
    req: request,
    env,
    executionCtx: {} as any,
    res: {} as any,
    var: {} as any,
    get: () => undefined,
    set: () => undefined,
    header: () => undefined,
    status: () => undefined,
    json: () => undefined,
    text: () => undefined,
    html: () => undefined,
    redirect: () => undefined,
    notFound: () => undefined,
    onError: () => undefined,
  }
}

// Helper to test Hono app
export const testApp = (app: Hono) => {
  return {
    async request(url: string, options: RequestInit = {}) {
      const request = createTestRequest(url, options)
      const response = await app.request(request)
      return response
    },
  }
}

// Mock database helpers
export const mockDbResult = (data: any) => ({
  first: () => Promise.resolve(data),
  run: () => Promise.resolve({ success: true, meta: { changes: 1 } }),
  all: () => Promise.resolve(data),
})

export const mockDbError = (message: string) => ({
  first: () => Promise.reject(new Error(message)),
  run: () => Promise.reject(new Error(message)),
  all: () => Promise.reject(new Error(message)),
})

// Mock fetch responses
export const mockFetchResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}

// Test data factories
export const createTestInviteCode = (overrides = {}) => ({
  code: 'TEST123',
  referrer_email: 'test@example.com',
  max_uses: 1,
  current_uses: 0,
  is_active: 1,
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createTestRegistration = (overrides = {}) => ({
  email: 'test@example.com',
  wallet: '0x1234567890abcdef1234567890abcdef12345678',
  type: 'nft' as const,
  registered_at: new Date().toISOString(),
  invite_code: null,
  ...overrides,
})

// Assertion helpers
export const expectJsonResponse = async (response: Response, expectedData: any) => {
  expect(response.headers.get('content-type')).toContain('application/json')
  const data = await response.json()
  expect(data).toEqual(expectedData)
}

export const expectErrorResponse = async (response: Response, expectedStatus: number) => {
  expect(response.status).toBe(expectedStatus)
  const data = await response.json()
  expect(data).toHaveProperty('error')
}
