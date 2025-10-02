'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function Header() {
  const { isConnected } = useAccount()

  return (
    <header className="w-full border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Moca VIP</h1>
            <p className="text-xs text-slate-400">Gating System</p>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="hidden items-center space-x-2 text-sm text-slate-300 sm:flex">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>Connected to Sepolia</span>
            </div>
          )}

          <ConnectButton
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
            chainStatus={{
              smallScreen: 'icon',
              largeScreen: 'full',
            }}
          />
        </div>
      </div>
    </header>
  )
}
