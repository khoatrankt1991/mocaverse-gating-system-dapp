'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
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

export default function EmailForm({
  wallet,
  inviteCode,
  registrationType,
  onSuccess,
  onBack,
}: EmailFormProps) {
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
    <div className="mx-auto w-full max-w-md">
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
              <div className="mb-4 rounded-lg bg-slate-700/50 p-4">
                <p className="mb-1 text-sm text-slate-400">Connected Wallet</p>
                <p className="font-mono text-xs break-all text-white">
                  {wallet}
                </p>
              </div>
            )}

            {inviteCode && (
              <div className="mb-4 rounded-lg bg-slate-700/50 p-4">
                <p className="mb-1 text-sm text-slate-400">Invite Code</p>
                <p className="font-mono text-sm text-white">{inviteCode}</p>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                clearError()
              }}
              error={error}
              disabled={isSubmitting}
              required
            />

            <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-4">
              <p className="text-sm text-yellow-200">
                {wallet
                  ? 'You will be asked to sign a message to verify wallet ownership.'
                  : 'Your email will be registered with your invite code.'}
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
