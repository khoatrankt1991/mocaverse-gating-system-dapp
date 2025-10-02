import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import InviteCodeForm from '../InviteCodeForm'

// Mock the useInviteCode hook
const mockVerifyCode = vi.fn()
const mockClearError = vi.fn()

const mockUseInviteCode = vi.fn()

vi.mock('@/hooks/useInviteCode', () => ({
  useInviteCode: () => mockUseInviteCode(),
}))

describe('InviteCodeForm', () => {
  const mockOnVerified = vi.fn()
  const mockOnBack = vi.fn()

  const defaultProps = {
    onVerified: mockOnVerified,
    onBack: mockOnBack,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Set default mock implementation
    mockUseInviteCode.mockReturnValue({
      verifyCode: mockVerifyCode,
      isVerifying: false,
      error: '',
      clearError: mockClearError,
    })
  })

  it('renders the form with correct title and description', () => {
    render(<InviteCodeForm {...defaultProps} />)

    expect(screen.getByText('Enter Your Invite Code')).toBeInTheDocument()
    expect(
      screen.getByText('Enter the exclusive invite code you received')
    ).toBeInTheDocument()
  })

  it('renders the input field with correct attributes', () => {
    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('maxLength', '13')
    expect(input).not.toBeDisabled()

    // Check label
    expect(screen.getByText('Invite Code')).toBeInTheDocument()
  })

  it('renders back and verify buttons', () => {
    render(<InviteCodeForm {...defaultProps} />)

    const backButton = screen.getByRole('button', { name: 'Back' })
    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })

    expect(backButton).toBeInTheDocument()
    expect(verifyButton).toBeInTheDocument()

    // Check button types
    expect(backButton).toHaveAttribute('type', 'button')
    expect(verifyButton).toHaveAttribute('type', 'submit')
  })

  it('converts input to uppercase automatically', async () => {
    const user = userEvent.setup()
    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')

    await user.type(input, 'moca-test123')

    expect(input).toHaveValue('MOCA-TEST123')
  })

  it('calls clearError when user types in input', async () => {
    const user = userEvent.setup()
    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')

    await user.type(input, 'A')

    expect(mockClearError).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<InviteCodeForm {...defaultProps} />)

    const backButton = screen.getByRole('button', { name: 'Back' })
    await user.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('submits form with uppercase code when verify button is clicked', async () => {
    const user = userEvent.setup()
    mockVerifyCode.mockResolvedValue(true)

    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })

    await user.type(input, 'moca-test123')
    await user.click(verifyButton)

    expect(mockVerifyCode).toHaveBeenCalledWith('MOCA-TEST123')
  })

  it('submits form with uppercase code when form is submitted via Enter', async () => {
    const user = userEvent.setup()
    mockVerifyCode.mockResolvedValue(true)

    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')

    await user.type(input, 'moca-test123')
    await user.keyboard('{Enter}')

    expect(mockVerifyCode).toHaveBeenCalledWith('MOCA-TEST123')
  })

  it('calls onVerified when code verification is successful', async () => {
    const user = userEvent.setup()
    mockVerifyCode.mockResolvedValue(true)

    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })

    await user.type(input, 'moca-test123')
    await user.click(verifyButton)

    await waitFor(() => {
      expect(mockOnVerified).toHaveBeenCalledWith('MOCA-TEST123')
    })
  })

  it('does not call onVerified when code verification fails', async () => {
    const user = userEvent.setup()
    mockVerifyCode.mockResolvedValue(false)

    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })

    await user.type(input, 'invalid-code')
    await user.click(verifyButton)

    await waitFor(() => {
      expect(mockOnVerified).not.toHaveBeenCalled()
    })
  })

  it('displays error message when there is an error', () => {
    const errorMessage = 'Invalid invite code'

    mockUseInviteCode.mockReturnValue({
      verifyCode: mockVerifyCode,
      isVerifying: false,
      error: errorMessage,
      clearError: mockClearError,
    })

    render(<InviteCodeForm {...defaultProps} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('disables form elements when verifying', () => {
    mockUseInviteCode.mockReturnValue({
      verifyCode: mockVerifyCode,
      isVerifying: true,
      error: '',
      clearError: mockClearError,
    })

    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    const backButton = screen.getByRole('button', { name: 'Back' })
    const verifyButton = screen.getByRole('button', { name: 'Loading...' })

    expect(input).toBeDisabled()
    expect(backButton).toBeDisabled()
    expect(verifyButton).toBeDisabled()
  })

  it('shows loading state on verify button when verifying', () => {
    mockUseInviteCode.mockReturnValue({
      verifyCode: mockVerifyCode,
      isVerifying: true,
      error: '',
      clearError: mockClearError,
    })

    render(<InviteCodeForm {...defaultProps} />)

    const verifyButton = screen.getByRole('button', { name: 'Loading...' })
    expect(verifyButton).toBeInTheDocument()
  })

  it('handles empty form submission', async () => {
    const user = userEvent.setup()
    mockVerifyCode.mockResolvedValue(false)

    render(<InviteCodeForm {...defaultProps} />)

    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })
    await user.click(verifyButton)

    expect(mockVerifyCode).toHaveBeenCalledWith('')
  })

  it('handles code with special characters', async () => {
    const user = userEvent.setup()
    mockVerifyCode.mockResolvedValue(true)

    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })

    await user.type(input, 'moca-test@123')
    await user.click(verifyButton)

    expect(mockVerifyCode).toHaveBeenCalledWith('MOCA-TEST@123')
  })

  it('handles maximum length input', async () => {
    const user = userEvent.setup()
    mockVerifyCode.mockResolvedValue(true)

    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })

    // Type exactly 13 characters
    await user.type(input, 'MOCA-TEST1234')
    await user.click(verifyButton)

    expect(mockVerifyCode).toHaveBeenCalledWith('MOCA-TEST1234')
  })

  it('prevents input longer than maxLength', async () => {
    const user = userEvent.setup()
    render(<InviteCodeForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')

    // Try to type more than 13 characters
    await user.type(input, 'MOCA-TEST123456789')

    // Should be truncated to 13 characters
    expect(input).toHaveValue('MOCA-TEST1234')
  })

  it('has proper form structure and accessibility', () => {
    const { container } = render(<InviteCodeForm {...defaultProps} />)

    // Check form element exists
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()

    // Check input exists
    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    expect(input).toBeInTheDocument()

    // Check label exists
    const label = screen.getByText('Invite Code')
    expect(label).toBeInTheDocument()

    // Check buttons have proper roles
    const backButton = screen.getByRole('button', { name: 'Back' })
    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })

    expect(backButton).toBeInTheDocument()
    expect(verifyButton).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    const { container } = render(<InviteCodeForm {...defaultProps} />)

    // Check main container
    const mainContainer = container.querySelector('.w-full.max-w-md.mx-auto')
    expect(mainContainer).toBeInTheDocument()

    // Check form spacing
    const form = container.querySelector('.space-y-4')
    expect(form).toBeInTheDocument()

    // Check button flex layout
    const buttonContainer = container.querySelector('.flex.gap-3')
    expect(buttonContainer).toBeInTheDocument()
  })

  it('handles multiple verification attempts', async () => {
    const user = userEvent.setup()
    const mockVerifyCodeMultiple = vi.fn()
    const mockOnVerifiedMultiple = vi.fn()

    // First call fails, second call succeeds
    mockVerifyCodeMultiple
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)

    mockUseInviteCode.mockReturnValue({
      verifyCode: mockVerifyCodeMultiple,
      isVerifying: false,
      error: '',
      clearError: mockClearError,
    })

    render(
      <InviteCodeForm onVerified={mockOnVerifiedMultiple} onBack={mockOnBack} />
    )

    const input = screen.getByPlaceholderText('MOCA-XXXXXXXX')
    const verifyButton = screen.getByRole('button', { name: 'Verify Code' })

    // First attempt - should fail
    await user.type(input, 'invalid-code')
    await user.click(verifyButton)

    await waitFor(() => {
      expect(mockOnVerifiedMultiple).not.toHaveBeenCalled()
    })

    // Clear input and try again
    await user.clear(input)
    await user.type(input, 'valid-code')
    await user.click(verifyButton)

    await waitFor(() => {
      expect(mockOnVerifiedMultiple).toHaveBeenCalledWith('VALID-CODE')
    })
  })
})
