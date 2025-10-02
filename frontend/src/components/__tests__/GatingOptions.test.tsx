import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import GatingOptions from '../GatingOptions'

describe('GatingOptions', () => {
  const mockOnSelectNFT = vi.fn()
  const mockOnSelectInvite = vi.fn()

  const defaultProps = {
    onSelectNFT: mockOnSelectNFT,
    onSelectInvite: mockOnSelectInvite,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main heading and description', () => {
    render(<GatingOptions {...defaultProps} />)

    expect(screen.getByText('Welcome to Moca VIP Access')).toBeInTheDocument()
    expect(
      screen.getByText('Choose your path to join our exclusive community')
    ).toBeInTheDocument()
  })

  it('renders both gating option cards', () => {
    render(<GatingOptions {...defaultProps} />)

    // NFT Option
    expect(screen.getByText('I own a')).toBeInTheDocument()
    expect(screen.getByText('Moca NFT')).toBeInTheDocument()

    // Invite Code Option
    expect(screen.getByText('Use My')).toBeInTheDocument()
    expect(screen.getByText('Invite Code')).toBeInTheDocument()
  })

  it('displays NFT option with correct content', () => {
    render(<GatingOptions {...defaultProps} />)

    // Main description
    expect(
      screen.getByText(
        'Own a Moca NFT(s) to claim Moca ID and get extra Moca holder benefits!'
      )
    ).toBeInTheDocument()

    // Staking requirement note
    expect(
      screen.getByText(
        '*Your Moca must be staked for the entire previous weekly staking period'
      )
    ).toBeInTheDocument()

    // Button
    expect(
      screen.getByRole('button', { name: 'Claim with Mocas!' })
    ).toBeInTheDocument()

    // NFT character emojis
    expect(screen.getByText('🤖')).toBeInTheDocument()
    expect(screen.getByText('🦄')).toBeInTheDocument()
    expect(screen.getByText('👾')).toBeInTheDocument()
  })

  it('displays invite code option with correct content', () => {
    render(<GatingOptions {...defaultProps} />)

    // Main description
    expect(
      screen.getByText(
        'Enter a Mocaverse distributed invite code to claim your own exclusive Moca ID!'
      )
    ).toBeInTheDocument()

    // Button
    expect(
      screen.getByRole('button', { name: 'Claim with Code!' })
    ).toBeInTheDocument()

    // Code flag
    expect(screen.getByText('Code')).toBeInTheDocument()

    // Input field
    const input = screen.getByPlaceholderText('Enter invite code')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('readOnly')
  })

  it('calls onSelectNFT when NFT card is clicked', async () => {
    const user = userEvent.setup()
    render(<GatingOptions {...defaultProps} />)

    const nftCard = screen.getByText('I own a').closest('[role="button"], div')
    if (nftCard) {
      await user.click(nftCard)
    }

    expect(mockOnSelectNFT).toHaveBeenCalledTimes(1)
  })

  it('calls onSelectInvite when invite code card is clicked', async () => {
    const user = userEvent.setup()
    render(<GatingOptions {...defaultProps} />)

    const inviteCard = screen
      .getByText('Use My')
      .closest('[role="button"], div')
    if (inviteCard) {
      await user.click(inviteCard)
    }

    expect(mockOnSelectInvite).toHaveBeenCalledTimes(1)
  })

  it('calls onSelectNFT when NFT button is clicked (card click also triggers)', async () => {
    const user = userEvent.setup()
    const mockOnSelectNFTButton = vi.fn()
    const mockOnSelectInviteButton = vi.fn()

    render(
      <GatingOptions
        onSelectNFT={mockOnSelectNFTButton}
        onSelectInvite={mockOnSelectInviteButton}
      />
    )

    const nftButton = screen.getByRole('button', { name: 'Claim with Mocas!' })
    await user.click(nftButton)

    // Both button click and card click trigger the same function
    expect(mockOnSelectNFTButton).toHaveBeenCalledTimes(2)
  })

  it('calls onSelectInvite when invite code button is clicked (card click also triggers)', async () => {
    const user = userEvent.setup()
    const mockOnSelectNFTButton = vi.fn()
    const mockOnSelectInviteButton = vi.fn()

    render(
      <GatingOptions
        onSelectNFT={mockOnSelectNFTButton}
        onSelectInvite={mockOnSelectInviteButton}
      />
    )

    const inviteButton = screen.getByRole('button', {
      name: 'Claim with Code!',
    })
    await user.click(inviteButton)

    // Both button click and card click trigger the same function
    expect(mockOnSelectInviteButton).toHaveBeenCalledTimes(2)
  })

  it('has proper responsive grid layout', () => {
    const { container } = render(<GatingOptions {...defaultProps} />)

    const gridContainer = container.querySelector('.grid.md\\:grid-cols-2')
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('gap-6')
  })

  it('applies correct styling classes', () => {
    const { container } = render(<GatingOptions {...defaultProps} />)

    // Check main container
    const mainContainer = container.querySelector('.w-full.max-w-4xl.mx-auto')
    expect(mainContainer).toBeInTheDocument()

    // Check cards have hover effects
    const cards = container.querySelectorAll('.hover\\:border-yellow-400')
    expect(cards).toHaveLength(2)

    // Check buttons have proper styling
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveClass(
        'bg-yellow-400',
        'text-black',
        'hover:bg-yellow-300'
      )
    })
  })

  it('displays NFT characters with proper styling', () => {
    const { container } = render(<GatingOptions {...defaultProps} />)

    // Check character containers
    const characterContainers = container.querySelectorAll('.w-16.h-16')
    expect(characterContainers).toHaveLength(3)

    // Check first character has gray background
    const firstCharacter = container.querySelector('.bg-gray-300')
    expect(firstCharacter).toBeInTheDocument()

    // Check other characters have white background (there are 3 white backgrounds total)
    const whiteCharacters = container.querySelectorAll('.bg-white')
    expect(whiteCharacters.length).toBeGreaterThanOrEqual(2)
  })

  it('displays code flag with proper styling', () => {
    const { container } = render(<GatingOptions {...defaultProps} />)

    const codeFlag = container.querySelector('.bg-pink-500')
    expect(codeFlag).toBeInTheDocument()
    expect(codeFlag).toHaveClass(
      'w-20',
      'h-12',
      'rounded-lg',
      'border-2',
      'border-white'
    )
  })

  it('has accessible button roles and labels', () => {
    render(<GatingOptions {...defaultProps} />)

    const nftButton = screen.getByRole('button', { name: 'Claim with Mocas!' })
    const inviteButton = screen.getByRole('button', {
      name: 'Claim with Code!',
    })

    expect(nftButton).toBeInTheDocument()
    expect(inviteButton).toBeInTheDocument()
  })

  it('renders all text content correctly', () => {
    render(<GatingOptions {...defaultProps} />)

    // Headings
    expect(screen.getByText('Welcome to Moca VIP Access')).toBeInTheDocument()
    expect(
      screen.getByText('Choose your path to join our exclusive community')
    ).toBeInTheDocument()

    // NFT section
    expect(screen.getByText('I own a')).toBeInTheDocument()
    expect(screen.getByText('Moca NFT')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Own a Moca NFT(s) to claim Moca ID and get extra Moca holder benefits!'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '*Your Moca must be staked for the entire previous weekly staking period'
      )
    ).toBeInTheDocument()

    // Invite section
    expect(screen.getByText('Use My')).toBeInTheDocument()
    expect(screen.getByText('Invite Code')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter a Mocaverse distributed invite code to claim your own exclusive Moca ID!'
      )
    ).toBeInTheDocument()

    // Buttons
    expect(screen.getByText('Claim with Mocas!')).toBeInTheDocument()
    expect(screen.getByText('Claim with Code!')).toBeInTheDocument()
  })

  it('handles multiple clicks correctly (each button click triggers twice due to card click)', async () => {
    const user = userEvent.setup()
    const mockOnSelectNFTMultiple = vi.fn()
    const mockOnSelectInviteMultiple = vi.fn()

    render(
      <GatingOptions
        onSelectNFT={mockOnSelectNFTMultiple}
        onSelectInvite={mockOnSelectInviteMultiple}
      />
    )

    const nftButton = screen.getByRole('button', { name: 'Claim with Mocas!' })
    const inviteButton = screen.getByRole('button', {
      name: 'Claim with Code!',
    })

    // Click NFT button multiple times
    await user.click(nftButton)
    await user.click(nftButton)

    // Click invite button multiple times
    await user.click(inviteButton)
    await user.click(inviteButton)

    // Each button click triggers both button and card click handlers
    expect(mockOnSelectNFTMultiple).toHaveBeenCalledTimes(4)
    expect(mockOnSelectInviteMultiple).toHaveBeenCalledTimes(4)
  })
})
