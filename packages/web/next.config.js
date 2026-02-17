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

  // Transpile TypeScript packages from the monorepo
  // Required for importing @codecompass/* packages
  transpilePackages: ['@codecompass/analyzer', '@codecompass/shared'],

  // Experimental features
  experimental: {
    serverActions: {
      // Increase body size limit to 2MB for repository file uploads
      bodySizeLimit: '2mb',
    },
  },

  // Image optimization configuration
  images: {
    // Allowed domains for next/image component
    // Add production domain before deploying
    domains: ['localhost'],
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
