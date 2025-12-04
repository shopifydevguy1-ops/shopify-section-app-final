"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles, Copy, Download, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

const KEYWORD_SUGGESTIONS = [
  "hero", "banner", "testimonial", "product grid", "featured collection",
  "image with text", "rich text", "newsletter", "video", "gallery",
  "countdown", "upsell", "cross-sell", "faq", "contact form"
]

export default function GeneratePage() {
  const { isSignedIn, isLoaded } = useUser()
  const { toast } = useToast()
  const [keyword, setKeyword] = useState("")
  const [customizations, setCustomizations] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      redirect("/sign-in")
      return
    }

    fetch("/api/user/me")
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(console.error)
  }, [isSignedIn, isLoaded])

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a keyword",
        variant: "destructive",
      })
      return
    }

    // Check generation limit
    const limitCheck = await fetch("/api/user/check-limit")
    const limitData = await limitCheck.json()

    if (!limitData.allowed) {
      toast({
        title: "Generation Limit Reached",
        description: limitData.remaining === 0
          ? "You've used all your free generations. Please upgrade to Pro."
          : `You have ${limitData.remaining} generations remaining.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, customizations }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate section")
      }

      setGeneratedCode(data.code)
      toast({
        title: "Success!",
        description: "Section generated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate section",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${keyword.replace(/\s+/g, "-")}-section.liquid`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Downloaded!",
      description: "Section file downloaded",
    })
  }

  if (!isLoaded) {
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle>Generate Section</CardTitle>
                <CardDescription>
                  {isPro ? "Unlimited generations" : `${remaining} generations remaining`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Keyword</label>
                  <Input
                    placeholder="e.g., hero, testimonial, banner"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {KEYWORD_SUGGESTIONS.slice(0, 5).map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setKeyword(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Customizations (Optional)
                  </label>
                  <Textarea
                    placeholder="e.g., Add dark mode support, use gradient background, include CTA button"
                    value={customizations}
                    onChange={(e) => setCustomizations(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !keyword.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Section
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle>Generated Code</CardTitle>
                <CardDescription>
                  Copy or download your Shopify Liquid section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedCode ? (
                  <>
                    <div className="border rounded-lg overflow-hidden">
                      <MonacoEditor
                        height="400px"
                        language="liquid"
                        value={generatedCode}
                        theme="vs-dark"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCopy} variant="outline" className="flex-1">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button onClick={handleDownload} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="h-[400px] flex items-center justify-center border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">Generated code will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

