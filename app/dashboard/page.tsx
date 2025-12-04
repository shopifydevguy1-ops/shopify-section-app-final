"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, TrendingUp, Crown } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser()
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
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SectionGen
          </span>
        </Link>
        <div className="flex gap-4">
          <Link href="/account">
            <Button variant="ghost">My Account</Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost">Admin</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Generations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {userData?.generationCount || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isPro ? "Unlimited" : `${remaining} remaining`}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold capitalize">
                  {userData?.subscriptionType || "Free"}
                </div>
                {!isPro && (
                  <Link href="/pricing">
                    <Button variant="link" className="p-0 mt-2">
                      Upgrade to Pro
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  Active
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Ready to generate
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Generator Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-3xl">Section Generator</CardTitle>
              <CardDescription>
                Describe the section you want to create (e.g., &quot;hero banner&quot;, &quot;testimonial&quot;, &quot;product grid&quot;)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/generate">
                <Button size="lg" className="w-full">
                  Start Generating
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upgrade Banner for Free Users */}
        {!isPro && remaining <= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="gradient-bg text-white border-0">
              <CardHeader>
                <CardTitle>Running Low on Generations?</CardTitle>
                <CardDescription className="text-white/90">
                  Upgrade to Pro for unlimited generations and faster AI responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pricing">
                  <Button variant="secondary" size="lg">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

