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
        {/* Left Section - Moca NFT ownership */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-400 transition-all cursor-pointer group" onClick={onSelectNFT}>
          <CardHeader className="text-center">
            <div className="mb-4">
              <span className="text-white text-lg">I own a </span>
              <span className="text-yellow-400 text-2xl font-bold">Moca NFT</span>
            </div>
            <CardDescription className="text-white text-sm mb-6">
              Own a Moca NFT(s) to claim Moca ID and get extra Moca holder benefits!
            </CardDescription>
            
            {/* NFT Characters */}
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🦄</span>
              </div>
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">👾</span>
              </div>
            </div>
            
            <p className="text-green-400 text-xs mb-6">
              *Your Moca must be staked for the entire previous weekly staking period
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              variant="primary" 
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-semibold" 
              onClick={onSelectNFT}
            >
              Claim with Mocas!
            </Button>
          </CardContent>
        </Card>

        {/* Right Section - Invite Code usage */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-400 transition-all cursor-pointer group" onClick={onSelectInvite}>
          <CardHeader className="text-center">
            <div className="mb-4">
              <span className="text-white text-lg">Use My </span>
              <span className="text-yellow-400 text-2xl font-bold">Invite Code</span>
            </div>
            <CardDescription className="text-white text-sm mb-6">
              Enter a Mocaverse distributed invite code to claim your own exclusive Moca ID!
            </CardDescription>
            
            {/* Code Flag */}
            <div className="flex justify-center mb-6">
              <div className="bg-pink-500 w-20 h-12 rounded-lg flex items-center justify-center border-2 border-white">
                <span className="text-white font-bold text-lg">Code</span>
              </div>
            </div>
            
            {/* Input Field */}
            <div className="mb-6">
              <input 
                type="text" 
                placeholder="Enter invite code" 
                className="w-full bg-white text-black px-4 py-2 rounded-lg placeholder-gray-500"
                readOnly
              />
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              variant="primary" 
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-semibold" 
              onClick={onSelectInvite}
            >
              Claim with Code!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

