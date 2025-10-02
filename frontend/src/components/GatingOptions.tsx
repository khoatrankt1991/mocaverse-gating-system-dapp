'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Button } from './ui/button'

interface GatingOptionsProps {
  onSelectNFT: () => void
  onSelectInvite: () => void
}

export default function GatingOptions({
  onSelectNFT,
  onSelectInvite,
}: GatingOptionsProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Welcome to Moca VIP Access
        </h1>
        <p className="text-xl text-slate-400">
          Choose your path to join our exclusive community
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Section - Moca NFT ownership */}
        <Card
          className="group cursor-pointer border-slate-700 bg-slate-800/50 transition-all hover:border-yellow-400"
          onClick={onSelectNFT}
        >
          <CardHeader className="text-center">
            <div className="mb-4">
              <span className="text-lg text-white">I own a </span>
              <span className="text-2xl font-bold text-yellow-400">
                Moca NFT
              </span>
            </div>
            <CardDescription className="mb-6 text-sm text-white">
              Own a Moca NFT(s) to claim Moca ID and get extra Moca holder
              benefits!
            </CardDescription>

            {/* NFT Characters */}
            <div className="mb-4 flex items-center justify-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-300">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white">
                <span className="text-2xl">🦄</span>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white">
                <span className="text-2xl">👾</span>
              </div>
            </div>

            <p className="mb-6 text-xs text-green-400">
              *Your Moca must be staked for the entire previous weekly staking
              period
            </p>
          </CardHeader>
          <CardContent>
            <Button
              variant="primary"
              className="w-full bg-yellow-400 font-semibold text-black hover:bg-yellow-300"
              onClick={onSelectNFT}
            >
              Claim with Mocas!
            </Button>
          </CardContent>
        </Card>

        {/* Right Section - Invite Code usage */}
        <Card
          className="group cursor-pointer border-slate-700 bg-slate-800/50 transition-all hover:border-yellow-400"
          onClick={onSelectInvite}
        >
          <CardHeader className="text-center">
            <div className="mb-4">
              <span className="text-lg text-white">Use My </span>
              <span className="text-2xl font-bold text-yellow-400">
                Invite Code
              </span>
            </div>
            <CardDescription className="mb-6 text-sm text-white">
              Enter a Mocaverse distributed invite code to claim your own
              exclusive Moca ID!
            </CardDescription>

            {/* Code Flag */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-12 w-20 items-center justify-center rounded-lg border-2 border-white bg-pink-500">
                <span className="text-lg font-bold text-white">Code</span>
              </div>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter invite code"
                className="w-full rounded-lg bg-white px-4 py-2 text-black placeholder-gray-500"
                readOnly
              />
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="primary"
              className="w-full bg-yellow-400 font-semibold text-black hover:bg-yellow-300"
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
