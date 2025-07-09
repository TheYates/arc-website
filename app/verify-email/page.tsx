"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { EmailVerificationService } from "@/lib/email-verification"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setError("No verification token provided")
      setIsLoading(false)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true)
    try {
      const result = await EmailVerificationService.verifyEmail(verificationToken)
      if (result.success) {
        setSuccess(true)
        setEmail(result.email || "")
      } else {
        setError(result.error || "Verification failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Verifying your email...</h2>
            <p className="text-slate-600">Please wait while we verify your email address.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-teal-600 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Alpha Rescue Consult</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              {success ? (
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl text-center text-slate-900">
              {success ? "Email Verified!" : "Verification Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <div className="text-center space-y-4">
                <p className="text-slate-600">
                  Your email address <strong>{email}</strong> has been successfully verified.
                </p>
                <p className="text-slate-600">You can now log in to your account and access all features.</p>
                <Link href="/login">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">Continue to Login</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <p className="text-slate-600">The verification link may have expired or been used already.</p>

                  <div className="space-y-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full bg-transparent">
                        Try Logging In
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="outline" className="w-full bg-transparent">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-600 hover:text-teal-600">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
