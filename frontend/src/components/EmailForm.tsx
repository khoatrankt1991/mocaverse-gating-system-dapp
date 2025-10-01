'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useRegistration } from '@/hooks/useRegistration'
import type { GatingMethod } from '@/types'

interface EmailFormProps {
  wallet?: string
  inviteCode?: string
  registrationType: GatingMethod
  onSuccess: () => void
  onBack: () => void
}

export default function EmailForm({ wallet, inviteCode, registrationType, onSuccess, onBack }: EmailFormProps) {
  const [email, setEmail] = useState('')
  const { register, isSubmitting, error, clearError } = useRegistration()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await register({
      email,
      wallet,
      inviteCode,
      registrationType,
    })

    if (success) {
      onSuccess()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Registration</CardTitle>
          <CardDescription>
            Enter your email to finalize your VIP access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {wallet && (
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-400 mb-1">Connected Wallet</p>
                <p className="font-mono text-xs text-white break-all">{wallet}</p>
              </div>
            )}

            {inviteCode && (
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-400 mb-1">Invite Code</p>
                <p className="font-mono text-sm text-white">{inviteCode}</p>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError()
              }}
              error={error}
              disabled={isSubmitting}
              required
            />

            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
              <p className="text-sm text-yellow-200">
                {wallet 
                  ? 'You will be asked to sign a message to verify wallet ownership.'
                  : 'Your email will be registered with your invite code.'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Complete Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
