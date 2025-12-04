"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Zap, Shield, Code } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

export default function LandingPage() {
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SectionGen
          </span>
        </div>
        <div className="flex gap-4">
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button>Dashboard</Button>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Generate Shopify Sections
            <br />
            with AI Magic
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Create beautiful, production-ready Shopify Liquid sections in seconds.
            No coding required. Just describe what you need.
          </p>
          <div className="flex gap-4 justify-center">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button size="lg" className="text-lg px-8">
                    Start Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View Pricing
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose SectionGen?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full glass hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-500 mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Generate sections in seconds, not hours
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full glass hover:shadow-xl transition-shadow">
              <CardHeader>
                <Code className="h-12 w-12 text-blue-500 mb-4" />
                <CardTitle>Production Ready</CardTitle>
                <CardDescription>
                  Clean, optimized Liquid code that follows best practices
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full glass hover:shadow-xl transition-shadow">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-purple-500 mb-4" />
                <CardTitle>AI Powered</CardTitle>
                <CardDescription>
                  Advanced AI understands your needs and customizes sections
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full glass hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle>Free to Start</CardTitle>
                <CardDescription>
                  10 free generations to try before you upgrade
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="gradient-bg text-white border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl mb-4">Ready to Get Started?</CardTitle>
              <CardDescription className="text-white/90 text-lg">
                Join thousands of developers creating amazing Shopify stores
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Start Free Today
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2025 SectionGen. All rights reserved.</p>
      </footer>
    </div>
  )
}

