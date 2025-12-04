"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, Crown, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AccountPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      redirect("/sign-in")
      return
    }

    fetch("/api/user/me")
      .then(res => res.json())
      .then(data => {
        setUserData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isSignedIn, isLoaded])

  if (!isLoaded || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const isPro = userData?.subscriptionType === "pro"
  const remaining = isPro ? -1 : Math.max(0, 10 - (userData?.generationCount || 0))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
          <Sparkles className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SectionGen
          </span>
        </Link>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-3xl">My Account</CardTitle>
              <CardDescription>
                Manage your account settings and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {user?.emailAddresses[0]?.emailAddress}</p>
                  <p><span className="font-medium">User ID:</span> {user?.id}</p>
                </div>
              </div>

              {/* Subscription Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Subscription</h3>
                <div className="flex items-center gap-2 mb-4">
                  {isPro ? (
                    <Crown className="h-5 w-5 text-purple-500" />
                  ) : (
                    <Zap className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="text-xl font-bold capitalize">
                    {userData?.subscriptionType || "Free"} Plan
                  </span>
                </div>
                {!isPro && (
                  <Link href="/pricing">
                    <Button>Upgrade to Pro</Button>
                  </Link>
                )}
              </div>

              {/* Usage Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Usage Statistics</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Total Generations:</span> {userData?.generationCount || 0}
                  </p>
                  <p>
                    <span className="font-medium">Remaining:</span>{" "}
                    {isPro ? "Unlimited" : `${remaining} generations`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="flex gap-4">
                  <Link href="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                  </Link>
                  {!isPro && (
                    <Link href="/pricing">
                      <Button>Upgrade to Pro</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

