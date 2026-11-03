/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingExcludes: {
    "*": [
      "./sections/**/*",
      "./section-library/**/*",
      "./data/**/*.png",
      "./data/**/*.jpg",
      "./data/**/*.webp",
    ],
  },
}

module.exports = nextConfig
