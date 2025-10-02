import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import EmailForm from '../EmailForm'
import type { GatingMethod } from '@/types'

// Mock the useRegistration hook
const mockRegister = vi.fn()
const mockClearError = vi.fn()

// Create a mock implementation that can be modified in tests
const mockUseRegistration = vi.fn()

vi.mock('@/hooks/useRegistration', () => ({
  useRegistration: () => mockUseRegistration(),
}))

// Mock the API functions
vi.mock('@/lib/api', () => ({
  isEmailUsed: vi.fn(),
  submitReservation: vi.fn(),
}))

describe('EmailForm', () => {
  const mockOnSuccess = vi.fn()
  const mockOnBack = vi.fn()
  const defaultProps = {
    registrationType: 'invite' as GatingMethod,
    onSuccess: mockOnSuccess,
    onBack: mockOnBack,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRegister.mockResolvedValue(true)

    // Set default mock implementation
    mockUseRegistration.mockReturnValue({
      register: mockRegister,
      isSubmitting: false,
      error: '',
      clearError: mockClearError,
    })
  })

  it('renders the form with correct title and description', () => {
    render(<EmailForm {...defaultProps} />)

    expect(screen.getByText('Complete Your Registration')).toBeInTheDocument()
    expect(
      screen.getByText('Enter your email to finalize your VIP access')
    ).toBeInTheDocument()
  })

  it('renders wallet information when wallet prop is provided', () => {
    const wallet = '0x1234567890abcdef1234567890abcdef12345678'
    render(<EmailForm {...defaultProps} wallet={wallet} />)

    expect(screen.getByText('Connected Wallet')).toBeInTheDocument()
    expect(screen.getByText(wallet)).toBeInTheDocument()
  })

  it('renders invite code information when inviteCode prop is provided', () => {
    const inviteCode = 'INVITE123'
    render(<EmailForm {...defaultProps} inviteCode={inviteCode} />)

    expect(screen.getByText('Invite Code')).toBeInTheDocument()
    expect(screen.getByText(inviteCode)).toBeInTheDocument()
  })

  it('shows correct warning message for wallet registration', () => {
    const wallet = '0x1234567890abcdef1234567890abcdef12345678'
    render(<EmailForm {...defaultProps} wallet={wallet} />)

    expect(
      screen.getByText(
        'You will be asked to sign a message to verify wallet ownership.'
      )
    ).toBeInTheDocument()
  })

  it('shows correct warning message for invite code registration', () => {
    render(<EmailForm {...defaultProps} />)

    expect(
      screen.getByText('Your email will be registered with your invite code.')
    ).toBeInTheDocument()
  })

  it('has email input field with correct attributes', () => {
    render(<EmailForm {...defaultProps} />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
  })

  it('has back and submit buttons', () => {
    render(<EmailForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Complete Registration' })
    ).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailForm {...defaultProps} />)

    const backButton = screen.getByRole('button', { name: 'Back' })
    await user.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('submits form with email when form is submitted', async () => {
    const user = userEvent.setup()

    render(<EmailForm {...defaultProps} />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', {
      name: 'Complete Registration',
    })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      wallet: undefined,
      inviteCode: undefined,
      registrationType: 'invite',
    })
  })

  it('passes wallet and inviteCode to register function when provided', async () => {
    const user = userEvent.setup()
    const wallet = '0x1234567890abcdef1234567890abcdef12345678'
    const inviteCode = 'INVITE123'

    render(
      <EmailForm {...defaultProps} wallet={wallet} inviteCode={inviteCode} />
    )

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', {
      name: 'Complete Registration',
    })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      wallet,
      inviteCode,
      registrationType: 'invite',
    })
  })

  it('calls onSuccess when registration is successful', async () => {
    const user = userEvent.setup()

    render(<EmailForm {...defaultProps} />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const submitButton = screen.getByRole('button', {
      name: 'Complete Registration',
    })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('displays error message when there is an error', () => {
    const errorMessage = 'Email is already registered'

    mockUseRegistration.mockReturnValue({
      register: mockRegister,
      isSubmitting: false,
      error: errorMessage,
      clearError: mockClearError,
    })

    render(<EmailForm {...defaultProps} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('disables form elements when submitting', () => {
    mockUseRegistration.mockReturnValue({
      register: mockRegister,
      isSubmitting: true,
      error: '',
      clearError: mockClearError,
    })

    render(<EmailForm {...defaultProps} />)

    const emailInput = screen.getByPlaceholderText('your@email.com')
    const backButton = screen.getByRole('button', { name: 'Back' })
    const submitButton = screen.getByRole('button', { name: 'Loading...' })

    expect(emailInput).toBeDisabled()
    expect(backButton).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})
