'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useNFTVerification } from '@/hooks/useNFTVerification'

interface NFTVerificationProps {
  onVerified: (wallet: string) => void
  onBack: () => void
}

export default function NFTVerification({ onVerified, onBack }: NFTVerificationProps) {
  const { address, isConnected } = useAccount()
  const { checkEligibility, isReadingContract, isChecking, error } = useNFTVerification(address)

  const handleCheckEligibility = async () => {
    if (!address) return
    
    const isEligible = await checkEligibility()
    if (isEligible) {
      onVerified(address)
    }
  }


  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Verify Your Moca NFT</CardTitle>
          <CardDescription>
            Connect your wallet to verify ownership of an eligible Moca NFT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <div className="bg-slate-700/50 rounded-lg p-4 text-sm text-slate-300">
                <p className="font-medium mb-2">Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Own a Moca NFT</li>
                  <li>NFT must be staked for at least 7 days</li>
                  <li>Connected to Sepolia testnet</li>
                </ul>
              </div>

              <div className="w-full">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <Button
                                variant="primary"
                                className="w-full"
                                onClick={openConnectModal}
                              >
                                Connect Wallet
                              </Button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Connected Wallet</p>
                <p className="font-mono text-sm text-white break-all">{address}</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {(isReadingContract || isChecking) && (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3 text-slate-300">Checking NFT eligibility...</span>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </Button>
            {isConnected && (
              <Button
                type="button"
                variant="primary"
                onClick={handleCheckEligibility}
                className="flex-1"
                disabled={isReadingContract || isChecking}
              >
                {isReadingContract || isChecking ? 'Checking...' : (error ? 'Retry' : 'Check NFT')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
