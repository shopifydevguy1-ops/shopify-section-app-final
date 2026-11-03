import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SectionGen — Free Shopify section studio",
  description: "Generate Shopify Liquid sections for free, with no account. Each section gets an image composed from the photos you upload.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
