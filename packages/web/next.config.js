/**
 * Next.js Configuration
 *
 * This file configures the Next.js framework for the CodeCompass web dashboard.
 * See CONFIG_GUIDE.md for detailed explanations of each setting.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Enable React strict mode for better error detection in development
  reactStrictMode: true,

  // Transpile TypeScript packages from the monorepo (if available)
  // These are optional workspace packages that may not be present on Vercel
  transpilePackages: [],

  // Experimental features
  experimental: {
    serverActions: {
      // Increase body size limit to 2MB for repository file uploads
      bodySizeLimit: '2mb',
    },
  },

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {
    // Externalize native modules that can't be bundled
    resolveExtensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
  },

  // Additional server externals for native modules
  serverExternalPackages: [
    'tree-sitter',
    'tree-sitter-typescript',
    'tree-sitter-python',
    'tree-sitter-java',
    'tree-sitter-rust',
    'tree-sitter-go',
  ],

  // Image optimization configuration
  images: {
    // Allowed remote patterns for next/image component
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline needed for Next.js
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.anthropic.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable browser XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Enforce HTTPS (enable in production)
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=31536000; includeSubDomains',
          // },
          // Permissions Policy (limit browser features)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Externalize tree-sitter native bindings for server-side
    if (isServer) {
      config.externals.push({
        'tree-sitter': 'commonjs tree-sitter',
        'tree-sitter-typescript': 'commonjs tree-sitter-typescript',
        'tree-sitter-python': 'commonjs tree-sitter-python',
        'tree-sitter-java': 'commonjs tree-sitter-java',
        'tree-sitter-rust': 'commonjs tree-sitter-rust',
      });
    }
    
    return config;
  },
}

module.exports = nextConfig
