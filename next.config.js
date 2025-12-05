/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'standalone' output for Vercel (Vercel handles Next.js natively)
  // Uncomment below if deploying to other platforms that need standalone
  // output: 'standalone',
}

module.exports = nextConfig

