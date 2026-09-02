import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mealz-product-team/design-system'],
  outputFileTracingIncludes: {
    '/guide': ['../design-system/docs/DESIGN.md', '../design-system/src/components/ui/**/*.design.md'],
    '/guide/[slug]': ['../design-system/docs/DESIGN.md', '../design-system/src/components/ui/**/*.design.md'],
  },
}

export default nextConfig
