# Moca Gating System - Frontend

A Next.js frontend application for the Moca VIP gating system that allows users to register using either a Moca NFT or an invite code.

## Features

- 🎨 **Dual Gating Methods**: NFT ownership or invite code verification
- 🔐 **Web3 Integration**: Connect wallet using wagmi for NFT verification
- 📱 **Responsive Design**: Mobile-first dark theme UI with TailwindCSS
- ✨ **Multi-step Flow**: Guided user experience with clear step transitions
- 🛡️ **Form Validation**: Client-side and server-side validation
- ⚡ **Real-time Verification**: Instant feedback for invite codes and NFT eligibility

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Web3**: wagmi + viem
- **Styling**: TailwindCSS v4
- **State Management**: React Query
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Access to Sepolia testnet

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NFT_CONTRACT=0xAAF273a3C22A61e8104D4DFC83c16e1E4E273a10
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

## User Flow

### 1. Select Gating Method
Users choose between:
- **NFT Path**: Connect wallet and verify NFT ownership
- **Invite Code Path**: Enter and verify invite code

### 2. Verification
- **NFT**: Automatically checks if wallet has eligible staked NFT (≥7 days)
- **Invite Code**: Validates code format and checks availability

### 3. Registration
- Enter email address
- Sign message with wallet (NFT path only)
- Submit registration

### 4. Success
- Confirmation screen
- Registration complete

## Components

### Core UI Components
- `Button`: Primary, secondary, and ghost variants with loading states
- `Input`: Styled input with label and error handling
- `Card`: Container component for content sections

### Feature Components
- `GatingOptions`: Landing page with two gating method cards
- `InviteCodeForm`: Input and verification for invite codes
- `NFTVerification`: Wallet connection and NFT eligibility check
- `EmailForm`: Final registration step with email and signature
- `SuccessScreen`: Completion confirmation

## Wagmi Configuration

The app uses wagmi for Web3 interactions:

```typescript
// src/config/wagmi.ts
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected({ target: 'metaMask' })],
  transports: {
    [sepolia.id]: http(),
  },
})
```

## API Integration

The frontend communicates with the backend API:

- `GET /api/verifyCode?code={code}` - Verify invite code
- `GET /api/checkWallet?wallet={address}` - Check NFT eligibility
- `GET /api/checkEmail?email={email}` - Check email availability
- `POST /api/reserve` - Submit registration

## Design System

### Colors
- **Background**: Slate-900 (#0f172a)
- **Cards**: Slate-800 with slate-700 borders
- **Primary**: Yellow-400 (accent color)
- **Text**: White/Slate-300

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold, white
- Body: Regular, slate-300

## Testing

### Manual Testing Checklist

1. **NFT Path**
   - [ ] Connect MetaMask wallet
   - [ ] Verify eligible NFT (staked ≥7 days)
   - [ ] Handle no NFT case
   - [ ] Sign message for registration

2. **Invite Code Path**
   - [ ] Enter valid invite code
   - [ ] Test invalid code format
   - [ ] Test expired/used code
   - [ ] Register with email

3. **Registration**
   - [ ] Email validation (format)
   - [ ] Duplicate email detection
   - [ ] Successful submission
   - [ ] Error handling

4. **Navigation**
   - [ ] Back buttons work correctly
   - [ ] Step transitions smooth
   - [ ] State preserved correctly

## Deployment

### Cloudflare Pages

```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out
```

### Vercel

```bash
# Deploy to Vercel
vercel deploy --prod
```

## Known Issues & Future Improvements

### Current Limitations
- Only supports MetaMask wallet
- Manual network switching required for Sepolia
- No persistent user sessions

### Future Enhancements
- [ ] WalletConnect support for mobile wallets
- [ ] Automatic network switching
- [ ] Email verification flow
- [ ] Social authentication options
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] Accessibility improvements (ARIA labels)
- [ ] Loading skeleton states
- [ ] Internationalization (i18n)

## Troubleshooting

### Wallet Connection Issues
- Ensure MetaMask is installed
- Switch to Sepolia testnet
- Check wallet is unlocked

### NFT Verification Fails
- Verify NFT is staked for ≥7 days
- Confirm correct network (Sepolia)
- Check contract address is correct

### API Errors
- Ensure backend is running
- Check API URL in `.env.local`
- Verify CORS settings

## License

MIT

## Contact

For issues or questions, please open an issue on GitHub.
