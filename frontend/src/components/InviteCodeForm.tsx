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
import { useInviteCode } from '@/hooks/useInviteCode'

interface InviteCodeFormProps {
  onVerified: (code: string) => void
  onBack: () => void
}

export default function InviteCodeForm({
  onVerified,
  onBack,
}: InviteCodeFormProps) {
  const [code, setCode] = useState('')
  const { verifyCode, isVerifying, error, clearError } = useInviteCode()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await verifyCode(code.toUpperCase())
    if (isValid) {
      onVerified(code.toUpperCase())
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Invite Code</CardTitle>
          <CardDescription>
            Enter the exclusive invite code you received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Invite Code"
              placeholder="MOCA-XXXXXXXX"
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase())
                clearError()
              }}
              error={error}
              maxLength={13}
              disabled={isVerifying}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isVerifying}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isVerifying}
                className="flex-1"
              >
                Verify Code
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
