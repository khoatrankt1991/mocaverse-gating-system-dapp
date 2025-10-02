import { vi, afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Mock Cloudflare Workers environment
globalThis.ENV = {
  DB: {} as any,
  API_KEY: 'test-api-key',
  NFT_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
  ALCHEMY_KEY: 'test-alchemy-key',
  RATE_LIMIT_KV: {} as any,
}

// Mock D1 database
const mockDb = {
  prepare: vi.fn().mockReturnValue({
    bind: vi.fn().mockReturnValue({
      first: vi.fn(),
      run: vi.fn(),
      all: vi.fn(),
    }),
  }),
}

// Mock KV storage
const mockKv = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

// Mock fetch for external API calls
globalThis.fetch = vi.fn()

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
}

// Export mocks for use in tests
export { mockDb, mockKv }
