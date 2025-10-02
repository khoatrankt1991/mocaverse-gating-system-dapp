import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import NFTVerification from '../NFTVerification'

// Mock wagmi hooks
const mockAddress = vi.fn()
const mockIsConnected = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: mockAddress(),
    isConnected: mockIsConnected(),
  }),
}))

// Mock RainbowKit ConnectButton
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Custom: ({ children }: { children: (props: any) => React.ReactNode }) => {
      const mockProps = {
        account: null,
        chain: null,
        openAccountModal: vi.fn(),
        openChainModal: vi.fn(),
        openConnectModal: vi.fn(),
        authenticationStatus: 'unauthenticated',
        mounted: true,
      }
      return children(mockProps)
    },
  },
}))

// Mock the useNFTVerification hook
const mockCheckEligibility = vi.fn()
const mockIsReadingContract = vi.fn()
const mockIsChecking = vi.fn()
const mockError = vi.fn()

const mockUseNFTVerification = vi.fn()

vi.mock('@/hooks/useNFTVerification', () => ({
  useNFTVerification: () => mockUseNFTVerification(),
}))

describe('NFTVerification', () => {
  const mockOnVerified = vi.fn()
  const mockOnBack = vi.fn()

  const defaultProps = {
    onVerified: mockOnVerified,
    onBack: mockOnBack,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Set default mock implementations
    mockAddress.mockReturnValue(null)
    mockIsConnected.mockReturnValue(false)

    mockUseNFTVerification.mockReturnValue({
      checkEligibility: mockCheckEligibility,
      isReadingContract: mockIsReadingContract(),
      isChecking: mockIsChecking(),
      error: mockError(),
    })
  })

  it('renders the form with correct title and description', () => {
    render(<NFTVerification {...defaultProps} />)

    expect(screen.getByText('Verify Your Moca NFT')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Connect your wallet to verify ownership of an eligible Moca NFT'
      )
    ).toBeInTheDocument()
  })

  it('shows requirements when wallet is not connected', () => {
    render(<NFTVerification {...defaultProps} />)

    expect(screen.getByText('Requirements:')).toBeInTheDocument()
    expect(screen.getByText('Own a Moca NFT')).toBeInTheDocument()
    expect(
      screen.getByText('NFT must be staked for at least 7 days')
    ).toBeInTheDocument()
    expect(screen.getByText('Connected to Sepolia testnet')).toBeInTheDocument()
  })

  it('shows connect wallet button when not connected', () => {
    render(<NFTVerification {...defaultProps} />)

    const connectButton = screen.getByRole('button', {
      name: 'Connect Wallet',
    })
    expect(connectButton).toBeInTheDocument()
  })

  it('shows connected wallet information when connected', () => {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
    mockAddress.mockReturnValue(walletAddress)
    mockIsConnected.mockReturnValue(true)

    render(<NFTVerification {...defaultProps} />)

    expect(screen.getByText('Connected Wallet')).toBeInTheDocument()
    expect(screen.getByText(walletAddress)).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<NFTVerification {...defaultProps} />)

    const backButton = screen.getByRole('button', { name: 'Back' })
    await user.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('calls checkEligibility when check button is clicked', async () => {
    const user = userEvent.setup()
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
    mockAddress.mockReturnValue(walletAddress)
    mockIsConnected.mockReturnValue(true)
    mockIsReadingContract.mockReturnValue(false)
    mockIsChecking.mockReturnValue(false)
    mockError.mockReturnValue('')
    mockCheckEligibility.mockResolvedValue(true)

    render(<NFTVerification {...defaultProps} />)

    const checkButton = screen.getByRole('button', { name: 'Check NFT' })
    await user.click(checkButton)

    expect(mockCheckEligibility).toHaveBeenCalledTimes(1)
  })

  it('calls onVerified when eligibility check succeeds', async () => {
    const user = userEvent.setup()
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
    mockAddress.mockReturnValue(walletAddress)
    mockIsConnected.mockReturnValue(true)
    mockIsReadingContract.mockReturnValue(false)
    mockIsChecking.mockReturnValue(false)
    mockError.mockReturnValue('')
    mockCheckEligibility.mockResolvedValue(true)

    render(<NFTVerification {...defaultProps} />)

    const checkButton = screen.getByRole('button', { name: 'Check NFT' })
    await user.click(checkButton)

    await waitFor(() => {
      expect(mockOnVerified).toHaveBeenCalledWith(walletAddress)
    })
  })

  it('does not call onVerified when eligibility check fails', async () => {
    const user = userEvent.setup()
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
    mockAddress.mockReturnValue(walletAddress)
    mockIsConnected.mockReturnValue(true)
    mockIsReadingContract.mockReturnValue(false)
    mockIsChecking.mockReturnValue(false)
    mockError.mockReturnValue('')
    mockCheckEligibility.mockResolvedValue(false)

    render(<NFTVerification {...defaultProps} />)

    const checkButton = screen.getByRole('button', { name: 'Check NFT' })
    await user.click(checkButton)

    await waitFor(() => {
      expect(mockOnVerified).not.toHaveBeenCalled()
    })
  })

  it('does not call checkEligibility when wallet is not connected', async () => {
    const user = userEvent.setup()
    render(<NFTVerification {...defaultProps} />)

    // No check button should be visible when not connected
    expect(
      screen.queryByRole('button', { name: 'Check NFT' })
    ).not.toBeInTheDocument()
    expect(mockCheckEligibility).not.toHaveBeenCalled()
  })

  it('applies correct styling classes', () => {
    const { container } = render(<NFTVerification {...defaultProps} />)

    // Check main container
    const mainContainer = container.querySelector('.w-full.max-w-md.mx-auto')
    expect(mainContainer).toBeInTheDocument()

    // Check requirements section
    const requirementsSection = container.querySelector('.bg-slate-700\\/50')
    expect(requirementsSection).toBeInTheDocument()

    // Check button container
    const buttonContainer = container.querySelector('.flex.gap-3')
    expect(buttonContainer).toBeInTheDocument()
  })

  it('renders all text content correctly', () => {
    render(<NFTVerification {...defaultProps} />)

    // Headings
    expect(screen.getByText('Verify Your Moca NFT')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Connect your wallet to verify ownership of an eligible Moca NFT'
      )
    ).toBeInTheDocument()

    // Requirements
    expect(screen.getByText('Requirements:')).toBeInTheDocument()
    expect(screen.getByText('Own a Moca NFT')).toBeInTheDocument()
    expect(
      screen.getByText('NFT must be staked for at least 7 days')
    ).toBeInTheDocument()
    expect(screen.getByText('Connected to Sepolia testnet')).toBeInTheDocument()

    // Buttons
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    render(<NFTVerification {...defaultProps} />)

    // Check buttons have proper roles
    const backButton = screen.getByRole('button', { name: 'Back' })
    const connectButton = screen.getByRole('button', {
      name: 'Connect Wallet',
    })

    expect(backButton).toBeInTheDocument()
    expect(connectButton).toBeInTheDocument()

    // Check list structure for requirements
    const requirementsList = screen.getByRole('list')
    expect(requirementsList).toBeInTheDocument()
  })

  it('handles wallet connection state changes', () => {
    // Start disconnected
    render(<NFTVerification {...defaultProps} />)
    expect(screen.getByText('Requirements:')).toBeInTheDocument()

    // Simulate connection
    mockAddress.mockReturnValue('0x1234567890abcdef1234567890abcdef12345678')
    mockIsConnected.mockReturnValue(true)

    // Re-render with new state
    render(<NFTVerification {...defaultProps} />)
    expect(screen.getByText('Connected Wallet')).toBeInTheDocument()
  })

  it('handles edge case when address is undefined', () => {
    mockAddress.mockReturnValue(undefined)
    mockIsConnected.mockReturnValue(false)

    render(<NFTVerification {...defaultProps} />)

    expect(screen.getByText('Requirements:')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Connect Wallet' })
    ).toBeInTheDocument()
  })
})
