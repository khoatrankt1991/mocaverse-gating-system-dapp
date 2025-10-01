import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'Moca Gating System',
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [sepolia],
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
