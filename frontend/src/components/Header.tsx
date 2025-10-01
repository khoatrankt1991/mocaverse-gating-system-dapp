'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="w-full bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">Moca VIP</h1>
            <p className="text-slate-400 text-xs">Gating System</p>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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
  );
}
