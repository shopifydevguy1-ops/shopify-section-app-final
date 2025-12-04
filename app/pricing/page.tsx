"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function PricingPage() {
  const { isSignedIn } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      window.location.href = "/sign-up"
      return
    }

    setLoading(true)
    try {
      // In a real implementation, you would:
      // 1. Create a payment intent with PayMongo
      // 2. Redirect to PayMongo checkout
      // 3. Handle the callback

      toast({
        title: "Redirecting to checkout",
        description: "You will be redirected to complete your payment",
      })

      // For now, we'll show a message
      // In production, integrate PayMongo checkout flow
      setTimeout(() => {
        toast({
          title: "Payment Integration",
          description: "PayMongo checkout integration needed. Please contact support.",
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate checkout",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SectionGen
          </span>
        </Link>
        <div className="flex gap-4">
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that works for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  Free
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>
                  Perfect for trying out SectionGen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>10 section generations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Access to all templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Code preview & download</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Community support</span>
                  </li>
                </ul>
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Current Plan
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full glass border-2 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-purple-500" />
                  Pro
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$20</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>
                  Unlimited generations for professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Unlimited generations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Faster AI responses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Advanced customization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Early access to new features</span>
                  </li>
                </ul>
                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full gradient-bg text-white hover:opacity-90"
                  size="lg"
                >
                  {loading ? "Processing..." : "Upgrade to Pro"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

