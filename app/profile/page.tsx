"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthHeader from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { User, Mail, Phone, MapPin, Calendar, Shield, Loader2, CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const { user, updateProfile, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
      })
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || "Failed to update profile")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      super_admin: "Super Administrator",
      admin: "Administrator",
      reviewer: "Medical Reviewer",
      care_giver: "Care Provider",
      patient: "Patient",
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      super_admin: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      reviewer: "bg-orange-100 text-orange-800",
      care_giver: "bg-green-100 text-green-800",
      patient: "bg-slate-100 text-slate-800",
    }
    return colors[role as keyof typeof colors] || "bg-slate-100 text-slate-800"
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="bg-teal-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <User className="h-10 w-10 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <Badge className={`mt-2 ${getRoleBadgeColor(user.role)}`}>{getRoleDisplayName(user.role)}</Badge>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">{user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">{user.address}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">
                      {user.isEmailVerified ? "Email Verified" : "Email Not Verified"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-slate-600">Update your personal details and contact information</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-800">Profile updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                      Address
                    </label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
