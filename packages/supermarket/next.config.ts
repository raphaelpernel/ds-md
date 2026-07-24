import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mealz-product-team/design-system'],
  images: {
    remotePatterns: [{ hostname: 'www.themealdb.com' }],
  },
}

export default nextConfig
