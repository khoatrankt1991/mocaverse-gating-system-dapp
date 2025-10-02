import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'Moca Gating System',
  projectId: 'moca-gating-system', // Simple project ID for development
  chains: [sepolia],
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
