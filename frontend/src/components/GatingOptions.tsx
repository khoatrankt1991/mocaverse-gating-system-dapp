'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

interface GatingOptionsProps {
  onSelectNFT: () => void
  onSelectInvite: () => void
}

export default function GatingOptions({ onSelectNFT, onSelectInvite }: GatingOptionsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Moca VIP Access
        </h1>
        <p className="text-xl text-slate-400">
          Choose your path to join our exclusive community
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:border-yellow-400 transition-all cursor-pointer group" onClick={onSelectNFT}>
          <CardHeader>
            <div className="text-4xl mb-4">🎨</div>
            <CardTitle className="group-hover:text-yellow-400 transition-colors">
              I have a Moca NFT
            </CardTitle>
            <CardDescription className="mt-2">
              Connect your wallet to verify your Moca NFT ownership. Your NFT must be staked for at least 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="primary" className="w-full" onClick={onSelectNFT}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-yellow-400 transition-all cursor-pointer group" onClick={onSelectInvite}>
          <CardHeader>
            <div className="text-4xl mb-4">🎫</div>
            <CardTitle className="group-hover:text-yellow-400 transition-colors">
              I have an Invite Code
            </CardTitle>
            <CardDescription className="mt-2">
              Enter your exclusive invite code to gain access. Each code has limited uses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="primary" className="w-full" onClick={onSelectInvite}>
              Enter Invite Code
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

