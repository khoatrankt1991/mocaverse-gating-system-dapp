import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],  // ← CHỈ Sepolia testnet
  connectors: [
    injected(),  // MetaMask auto-detect
  ],
  transports: {
    [sepolia.id]: http(),  // ← CHỈ Sepolia RPC
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
