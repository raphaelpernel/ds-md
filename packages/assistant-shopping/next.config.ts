import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mealz-product-team/design-system'],
  images: {
    // Demo mirror pages use local placeholder SVGs as static backgrounds (see
    // packages/assistant-shopping/public/demo). CSP sandboxes the SVG (no scripts).
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
