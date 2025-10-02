'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function SuccessScreen() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-yellow-400">
        <CardHeader className="text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <CardTitle className="text-2xl text-yellow-400">
            Welcome to Moca VIP!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-700/50 p-6 text-center">
            <p className="mb-4 text-slate-300">
              Your registration has been successfully completed!
            </p>
            <p className="text-sm text-slate-400">
              You will receive further instructions via email about accessing
              the VIP system.
            </p>
          </div>

          <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-4">
            <p className="text-center text-sm text-yellow-200">
              Thank you for joining our exclusive community! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
