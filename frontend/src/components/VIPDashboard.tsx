'use client'

import { useAccount } from 'wagmi'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Button } from './ui/button'
import { useVIPStatus } from '../hooks/useVIPStatus'

interface VIPDashboardProps {
  onDisconnect?: () => void
}

export default function VIPDashboard({ onDisconnect }: VIPDashboardProps) {
  const { address } = useAccount()
  const { registration, isLoading } = useVIPStatus()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
              <p className="text-slate-400">Checking VIP status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRegistrationTypeLabel = (type: string) => {
    return type === 'nft' ? 'NFT Holder' : 'Invite Code'
  }

  const getRegistrationTypeIcon = (type: string) => {
    return type === 'nft' ? '🎨' : '🎫'
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Welcome Card */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <span className="text-2xl">👑</span>
          </div>
          <CardTitle className="text-2xl text-white">
            Welcome, VIP Member!
          </CardTitle>
          <CardDescription className="text-slate-300">
            You have successfully joined the Moca VIP community
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Registration Details */}
      {registration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">
                {getRegistrationTypeIcon(registration.type)}
              </span>
              Registration Details
            </CardTitle>
            <CardDescription>Your VIP membership information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Email
                </label>
                <p className="text-white">{registration.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Wallet Address
                </label>
                <p className="font-mono text-sm text-white">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Registration Type
                </label>
                <p className="text-white">
                  {getRegistrationTypeLabel(registration.type)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Registered At
                </label>
                <p className="text-white">
                  {formatDate(registration.registeredAt)}
                </p>
              </div>
            </div>

            {registration.inviteCode && (
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Invite Code Used
                </label>
                <p className="font-mono text-white">
                  {registration.inviteCode}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* VIP Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            VIP Benefits
          </CardTitle>
          <CardDescription>Exclusive perks for VIP members</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Access to exclusive Moca community
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Priority support and updates
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Early access to new features
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Special events and airdrops
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={onDisconnect}
          className="text-slate-400 hover:text-white"
        >
          Disconnect Wallet
        </Button>
      </div>
    </div>
  )
}
