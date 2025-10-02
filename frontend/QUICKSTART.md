# Frontend Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Backend API running (default: http://localhost:8787)
- MetaMask wallet extension
- Sepolia testnet access

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   Create `.env.local` file:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8787
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_NFT_CONTRACT=0xAAF273a3C22A61e8104D4DFC83c16e1E4E273a10
   ```

3. **Run development server:**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Architecture

### Project Structure

```
src/
├── app/
│   ├── providers/
│   │   ├── config.ts       # Wagmi config (Sepolia only)
│   │   └── index.tsx       # Web3Provider wrapper
│   ├── page.tsx            # Main flow controller
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Dark theme styles
├── components/
│   ├── ui/                 # Base components (Button, Input, Card)
│   ├── GatingOptions.tsx   # Landing page
│   ├── InviteCodeForm.tsx  # Invite code verification
│   ├── NFTVerification.tsx # Wallet connection & NFT check
│   ├── EmailForm.tsx       # Email registration
│   └── SuccessScreen.tsx   # Success confirmation
├── hooks/
│   ├── useWallet.ts        # Wallet connection hook
│   ├── useInviteCode.ts    # Invite code verification hook
│   ├── useNFTVerification.ts # NFT eligibility check hook
│   └── useRegistration.ts  # Registration submission hook
└── lib/
    ├── api.ts              # Backend API client
    └── nft-abi.ts          # Smart contract ABI
```

### Custom Hooks

**useWallet** - Wallet connection management

```typescript
const { address, isConnected, connectWallet } = useWallet()
```

**useInviteCode** - Invite code verification

```typescript
const { verifyCode, isVerifying, error } = useInviteCode()
const isValid = await verifyCode('MOCA-XXXXXXXX')
```

**useNFTVerification** - NFT eligibility check

```typescript
const { checkEligibility, isChecking, error } = useNFTVerification(address)
const isEligible = await checkEligibility()
```

**useRegistration** - Registration submission

```typescript
const { register, isSubmitting, error } = useRegistration()
const success = await register({ email, wallet, registrationType })
```

## User Flow

### Path 1: NFT Verification

1. User clicks **"I have a Moca NFT"**
2. Click **"Connect Wallet"** → MetaMask opens
3. Approve connection → Wallet address displayed
4. Click **"Check NFT"** button
5. App reads smart contract `hasEligibleNFT(address)` via wagmi
6. If eligible → proceed to email registration
7. Sign message to verify wallet ownership
8. Submit registration → Success!

### Path 2: Invite Code

1. User clicks **"I have an Invite Code"**
2. Enter invite code (format: MOCA-XXXXXXXX)
3. Real-time validation → API verification
4. If valid → proceed to email registration
5. Enter email → Submit (no signature needed)
6. Registration complete → Success!

## Wagmi Configuration

### Config (`src/app/providers/config.ts`)

```typescript
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia], // Sepolia testnet only
  connectors: [injected()], // MetaMask auto-detect
  transports: {
    [sepolia.id]: http(), // Public Sepolia RPC
  },
  ssr: true, // Next.js App Router
})
```

### Provider Setup

```typescript
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';

export function Web3Provider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Testing the App

### Manual Testing Checklist

**NFT Path:**

- [ ] Connect MetaMask wallet
- [ ] Switch to Sepolia testnet (if needed)
- [ ] Click "Check NFT" button
- [ ] See loading state while checking
- [ ] Handle "No eligible NFT" error (expected if no staked NFT)
- [ ] If eligible, proceed to email form
- [ ] Sign message to verify ownership
- [ ] Complete registration

**Invite Code Path:**

- [ ] Enter invalid code → see error
- [ ] Enter valid code (get from backend admin)
- [ ] Proceed to email registration
- [ ] Submit and see success

**Edge Cases:**

- [ ] Duplicate email detection
- [ ] Invalid email format
- [ ] Signature rejection
- [ ] Network errors

## Troubleshooting

### Wallet Connection Issues

**Problem:** MetaMask not connecting

- Ensure MetaMask is installed
- Unlock MetaMask wallet
- Refresh page and try again

**Problem:** Wrong network

- Open MetaMask
- Switch to Sepolia testnet manually
- Reconnect wallet

### NFT Verification Issues

**Problem:** Loading indefinitely

- Check browser console for errors
- Verify contract address in `.env.local`
- Check network tab for RPC calls

**Problem:** "No eligible NFT" error

- This is expected if wallet doesn't have staked NFT
- Need admin to mint NFT with 7-day stake timestamp
- See smart contract updates needed below

### API Errors

**Problem:** API calls failing

- Ensure backend is running on port 8787
- Check CORS settings in backend
- Verify API_URL in `.env.local`

## Known Issues & Limitations

### Current Limitations

1. **NFT Testing:**
   - Smart contract needs admin function to mint pre-staked NFTs
   - Current wallets don't have eligible NFTs for testing
2. **Network:**
   - Sepolia testnet only
   - No mainnet support
3. **Wallet:**
   - MetaMask only (no WalletConnect)
   - Manual network switching required

### Smart Contract Update Needed

Add to `MockMocaNFT.sol`:

```solidity
// Admin function to mint NFT with backdated stake
function adminMintAndStake(address to, uint256 daysAgo) external onlyOwner {
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);

    stakes[tokenId] = StakeInfo({
        stakedAt: block.timestamp - (daysAgo * 1 days),
        isStaked: true
    });
}
```

Usage for testing:

```bash
# Mint NFT staked 7 days ago
npx hardhat run scripts/admin-mint.js --network sepolia
```

## Build for Production

```bash
# Build
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel deploy --prod

# Or Cloudflare Pages
npx wrangler pages deploy .next
```

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router, Turbopack)
- **Web3**: wagmi v2 + viem
- **State**: @tanstack/react-query
- **Styling**: TailwindCSS v4
- **TypeScript**: Full type safety
- **Network**: Sepolia testnet

## Environment Variables

Required in `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8787

# Blockchain
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NFT_CONTRACT=0xAAF273a3C22A61e8104D4DFC83c16e1E4E273a10
```

## Development Tips

1. **Always restart dev server** after changing `.env.local`
2. **Check browser console** for debugging info
3. **Use Network tab** to monitor RPC calls
4. **MetaMask must be on Sepolia** for NFT verification

## Next Steps

- [ ] Update smart contract with admin mint function
- [ ] Test with eligible NFT
- [ ] Add email verification flow
- [ ] Implement session persistence
- [ ] Add WalletConnect support
- [ ] Deploy to production

---

**Status**: ✅ Phase 3 Complete - Frontend functional with wagmi

Need help? Check main README.md for full documentation.
