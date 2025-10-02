import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import VIPDashboard from '../VIPDashboard'

// Mock wagmi hooks
const mockAddress = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: mockAddress(),
  }),
}))

// Mock the useVIPStatus hook
const mockRegistration = vi.fn()
const mockIsLoading = vi.fn()

const mockUseVIPStatus = vi.fn()

vi.mock('@/hooks/useVIPStatus', () => ({
  useVIPStatus: () => mockUseVIPStatus(),
}))

describe('VIPDashboard', () => {
  const mockOnDisconnect = vi.fn()

  const defaultProps = {
    onDisconnect: mockOnDisconnect,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Set default mock implementations
    mockAddress.mockReturnValue('0x1234567890abcdef1234567890abcdef12345678')

    mockUseVIPStatus.mockReturnValue({
      registration: mockRegistration(),
      isLoading: mockIsLoading(),
    })
  })

  it('renders VIP benefits section', () => {
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({
      email: 'test@example.com',
      type: 'nft',
      registeredAt: '2024-01-15T10:30:00Z',
      inviteCode: null,
    })

    render(<VIPDashboard {...defaultProps} />)

    expect(screen.getByText('VIP Benefits')).toBeInTheDocument()
    expect(
      screen.getByText('Exclusive perks for VIP members')
    ).toBeInTheDocument()
    expect(screen.getByText('✨')).toBeInTheDocument()

    // Check all benefit items
    expect(
      screen.getByText('Access to exclusive Moca community')
    ).toBeInTheDocument()
    expect(screen.getByText('Priority support and updates')).toBeInTheDocument()
    expect(screen.getByText('Early access to new features')).toBeInTheDocument()
    expect(screen.getByText('Special events and airdrops')).toBeInTheDocument()
  })

  it('renders disconnect button', () => {
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({
      email: 'test@example.com',
      type: 'nft',
      registeredAt: '2024-01-15T10:30:00Z',
      inviteCode: null,
    })

    render(<VIPDashboard {...defaultProps} />)

    const disconnectButton = screen.getByRole('button', {
      name: 'Disconnect Wallet',
    })
    expect(disconnectButton).toBeInTheDocument()
  })

  it('calls onDisconnect when disconnect button is clicked', async () => {
    const user = userEvent.setup()
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({
      email: 'test@example.com',
      type: 'nft',
      registeredAt: '2024-01-15T10:30:00Z',
      inviteCode: null,
    })

    render(<VIPDashboard {...defaultProps} />)

    const disconnectButton = screen.getByRole('button', {
      name: 'Disconnect Wallet',
    })
    await user.click(disconnectButton)

    expect(mockOnDisconnect).toHaveBeenCalledTimes(1)
  })

  it('handles missing onDisconnect prop gracefully', () => {
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({
      email: 'test@example.com',
      type: 'nft',
      registeredAt: '2024-01-15T10:30:00Z',
      inviteCode: null,
    })

    render(<VIPDashboard />)

    const disconnectButton = screen.getByRole('button', {
      name: 'Disconnect Wallet',
    })
    expect(disconnectButton).toBeInTheDocument()
  })

  it('handles undefined wallet address', () => {
    mockAddress.mockReturnValue(undefined)
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({
      email: 'test@example.com',
      type: 'nft',
      registeredAt: '2024-01-15T10:30:00Z',
      inviteCode: null,
    })

    render(<VIPDashboard {...defaultProps} />)

    // Should still render the dashboard
    expect(screen.getByText('VIP Benefits')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({
      email: 'test@example.com',
      type: 'nft',
      registeredAt: '2024-01-15T10:30:00Z',
      inviteCode: null,
    })

    const { container } = render(<VIPDashboard {...defaultProps} />)

    // Check main container
    const mainContainer = container.querySelector('.w-full.max-w-2xl.mx-auto')
    expect(mainContainer).toBeInTheDocument()

    // Check VIP icon container
    const iconContainer = container.querySelector(
      '.w-16.h-16.bg-gradient-to-br'
    )
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders all text content correctly', () => {
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({
      email: 'test@example.com',
      type: 'nft',
      registeredAt: '2024-01-15T10:30:00Z',
      inviteCode: null,
    })

    render(<VIPDashboard {...defaultProps} />)

    // VIP Benefits
    expect(screen.getByText('VIP Benefits')).toBeInTheDocument()
    expect(
      screen.getByText('Exclusive perks for VIP members')
    ).toBeInTheDocument()

    // Benefits list
    expect(
      screen.getByText('Access to exclusive Moca community')
    ).toBeInTheDocument()
    expect(screen.getByText('Priority support and updates')).toBeInTheDocument()
    expect(screen.getByText('Early access to new features')).toBeInTheDocument()
    expect(screen.getByText('Special events and airdrops')).toBeInTheDocument()

    // Actions
    expect(screen.getByText('Disconnect Wallet')).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({
      email: 'test@example.com',
      type: 'nft',
      registeredAt: '2024-01-15T10:30:00Z',
      inviteCode: null,
    })

    render(<VIPDashboard {...defaultProps} />)

    // Check headings
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)

    // Check button
    const disconnectButton = screen.getByRole('button', {
      name: 'Disconnect Wallet',
    })
    expect(disconnectButton).toBeInTheDocument()

    // Check list structure for benefits
    const benefitsList = screen.getByRole('list')
    expect(benefitsList).toBeInTheDocument()
  })

  it('handles edge case with empty registration object', () => {
    mockIsLoading.mockReturnValue(false)
    mockRegistration.mockReturnValue({})

    render(<VIPDashboard {...defaultProps} />)

    // Should still render welcome card and benefits
    expect(screen.getByText('VIP Benefits')).toBeInTheDocument()
  })
})
