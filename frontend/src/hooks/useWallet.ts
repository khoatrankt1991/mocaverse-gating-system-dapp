'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const connectWallet = () => {
    const injectedConnector = connectors.find((c) => c.id === 'injected')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  return {
    address,
    isConnected,
    isConnecting: isPending,
    connectWallet,
    disconnect,
  }
}

