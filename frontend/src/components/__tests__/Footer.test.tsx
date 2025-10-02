import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders the footer with correct structure', () => {
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('displays the brand section with logo and title', () => {
    render(<Footer />)

    expect(screen.getByText('Moca VIP Gating System')).toBeInTheDocument()
    expect(screen.getByText('Web3 Access Control Platform')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument() // Logo letter
  })

  it('renders all navigation links with correct hrefs', () => {
    render(<Footer />)

    const apiDocsLink = screen.getByRole('link', { name: 'API Docs' })
    const smartContractLink = screen.getByRole('link', {
      name: 'Smart Contract',
    })
    const githubLink = screen.getByRole('link', { name: 'GitHub' })

    expect(apiDocsLink).toBeInTheDocument()
    expect(apiDocsLink).toHaveAttribute(
      'href',
      'https://moca-gating-system.kai-tran9xx.workers.dev/docs'
    )
    expect(apiDocsLink).toHaveAttribute('target', '_blank')
    expect(apiDocsLink).toHaveAttribute('rel', 'noopener noreferrer')

    expect(smartContractLink).toBeInTheDocument()
    expect(smartContractLink).toHaveAttribute(
      'href',
      'https://sepolia.etherscan.io/address/0x88a1Dbe9568dDb8764EA10b279801E146Be6C531'
    )
    expect(smartContractLink).toHaveAttribute('target', '_blank')
    expect(smartContractLink).toHaveAttribute('rel', 'noopener noreferrer')

    expect(githubLink).toBeInTheDocument()
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/khoatrankt1991/mocaverse-gating-system-dapp'
    )
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('displays author information with email link', () => {
    render(<Footer />)

    expect(screen.getByText('Built with ❤️ by')).toBeInTheDocument()

    const authorLink = screen.getByRole('link', { name: 'Khoa Tran' })
    expect(authorLink).toBeInTheDocument()
    expect(authorLink).toHaveAttribute(
      'href',
      'mailto:khoatran.kt1991@gmail.com'
    )

    expect(screen.getByText('Full-Stack Web3 Developer')).toBeInTheDocument()
  })

  it('shows copyright information', () => {
    render(<Footer />)

    const copyrightText = screen.getByText(/© 2024 Moca VIP Gating System/)
    expect(copyrightText).toBeInTheDocument()
    expect(copyrightText).toHaveTextContent(
      'Built with Next.js, Cloudflare Workers, and Solidity.'
    )
  })

  it('has proper responsive classes', () => {
    const { container } = render(<Footer />)

    // Check for responsive flex classes
    const mainContainer = container.querySelector(
      '.flex.flex-col.md\\:flex-row'
    )
    expect(mainContainer).toBeInTheDocument()

    // Check for responsive text alignment
    const authorSection = container.querySelector(
      '.text-center.md\\:text-right'
    )
    expect(authorSection).toBeInTheDocument()

    // Check for responsive spacing
    const spacingElement = container.querySelector('.space-y-4.md\\:space-y-0')
    expect(spacingElement).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    const { container } = render(<Footer />)

    // Check footer has proper background and border
    const footer = container.querySelector('footer')
    expect(footer).toHaveClass(
      'bg-slate-900/50',
      'border-t',
      'border-slate-700',
      'mt-auto'
    )

    // Check brand logo has gradient background
    const logo = container.querySelector(
      '.bg-gradient-to-br.from-purple-500.to-pink-500'
    )
    expect(logo).toBeInTheDocument()

    // Check links have hover effects
    const links = container.querySelectorAll('a')
    links.forEach(link => {
      expect(link).toHaveClass('transition-colors')
    })
  })

  it('renders all text content correctly', () => {
    render(<Footer />)

    // Brand section
    expect(screen.getByText('Moca VIP Gating System')).toBeInTheDocument()
    expect(screen.getByText('Web3 Access Control Platform')).toBeInTheDocument()

    // Navigation links
    expect(screen.getByText('API Docs')).toBeInTheDocument()
    expect(screen.getByText('Smart Contract')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()

    // Author section
    expect(screen.getByText('Built with ❤️ by')).toBeInTheDocument()
    expect(screen.getByText('Khoa Tran')).toBeInTheDocument()
    expect(screen.getByText('Full-Stack Web3 Developer')).toBeInTheDocument()

    // Copyright
    expect(
      screen.getByText(/© 2024 Moca VIP Gating System/)
    ).toBeInTheDocument()
  })

  it('has accessible structure with proper semantic elements', () => {
    render(<Footer />)

    // Check for footer semantic element
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()

    // Check for heading structure
    const heading = screen.getByRole('heading', {
      name: 'Moca VIP Gating System',
    })
    expect(heading).toBeInTheDocument()
    expect(heading.tagName).toBe('H3')
  })

  it('handles external links with proper security attributes', () => {
    render(<Footer />)

    const externalLinks = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('target') === '_blank')

    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
