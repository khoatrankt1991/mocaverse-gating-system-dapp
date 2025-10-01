'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function SuccessScreen() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-yellow-400">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <CardTitle className="text-2xl text-yellow-400">
            Welcome to Moca VIP!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-6 text-center">
            <p className="text-slate-300 mb-4">
              Your registration has been successfully completed!
            </p>
            <p className="text-sm text-slate-400">
              You will receive further instructions via email about accessing the VIP system.
            </p>
          </div>

          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
            <p className="text-sm text-yellow-200 text-center">
              Thank you for joining our exclusive community! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

