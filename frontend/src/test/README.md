# Testing Setup

This directory contains the testing configuration and utilities for the frontend application.

## Configuration

- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing utilities
- **jsdom**: DOM environment for testing

## Files

- `setup.ts`: Global test setup and mocks
- `test-utils.tsx`: Custom render function with providers
- `README.md`: This documentation

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are located in `__tests__` directories next to the components they test:

```
src/
  components/
    EmailForm.tsx
    __tests__/
      EmailForm.test.tsx
```

## Mocking

- Next.js router and navigation are mocked
- API functions are mocked
- Custom hooks are mocked using Vitest's `vi.mock()`

## Example Test

See `EmailForm.test.tsx` for a comprehensive example of testing a React component with:

- Rendering tests
- User interaction tests
- Mock function verification
- Error state testing
- Loading state testing
