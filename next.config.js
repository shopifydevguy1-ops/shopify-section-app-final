/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the large optional section library out of serverless function bundles.
  outputFileTracingExcludes: {
    "*": [
      "./sections/**/*.liquid",
      "./section-library/**/*",
    ],
  },
}

module.exports = nextConfig
