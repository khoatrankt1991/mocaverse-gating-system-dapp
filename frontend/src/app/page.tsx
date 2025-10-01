'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import GatingOptions from '@/components/GatingOptions'
import InviteCodeForm from '@/components/InviteCodeForm'
import NFTVerification from '@/components/NFTVerification'
import EmailForm from '@/components/EmailForm'
import SuccessScreen from '@/components/SuccessScreen'
import type { Step, GatingMethod } from '@/types'

export default function Home() {
  const [step, setStep] = useState<Step>('select')
  const [registrationType, setRegistrationType] = useState<GatingMethod>('nft')
  const [wallet, setWallet] = useState<string>()
  const [inviteCode, setInviteCode] = useState<string>()

  const handleSelectNFT = () => {
    setRegistrationType('nft')
    setStep('verify-nft')
  }

  const handleSelectInvite = () => {
    setRegistrationType('invite')
    setStep('verify-code')
  }

  const handleCodeVerified = (code: string) => {
    setInviteCode(code)
    setStep('register')
  }

  const handleNFTVerified = (walletAddress: string) => {
    setWallet(walletAddress)
    setStep('register')
  }

  const handleRegistrationSuccess = () => {
    setStep('success')
  }

  const handleBackToSelect = () => {
    setStep('select')
    setWallet(undefined)
    setInviteCode(undefined)
  }

  const handleBackToVerify = () => {
    if (registrationType === 'nft') {
      setStep('verify-nft')
    } else {
      setStep('verify-code')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-6xl">
          {step === 'select' && (
            <GatingOptions
              onSelectNFT={handleSelectNFT}
              onSelectInvite={handleSelectInvite}
            />
          )}

          {step === 'verify-code' && (
            <InviteCodeForm
              onVerified={handleCodeVerified}
              onBack={handleBackToSelect}
            />
          )}

          {step === 'verify-nft' && (
            <NFTVerification
              onVerified={handleNFTVerified}
              onBack={handleBackToSelect}
            />
          )}

          {step === 'register' && (
            <EmailForm
              wallet={wallet}
              inviteCode={inviteCode}
              registrationType={registrationType}
              onSuccess={handleRegistrationSuccess}
              onBack={handleBackToVerify}
            />
          )}

          {step === 'success' && <SuccessScreen />}
        </div>
      </main>
    </div>
  )
}
