/**
 * PostCSS Configuration
 *
 * PostCSS processes CSS files before they're bundled.
 * See CONFIG_GUIDE.md for detailed explanations.
 */
module.exports = {
  plugins: {
    // Process Tailwind CSS directives (@tailwind, @apply, etc.)
    tailwindcss: {},
    // Add vendor prefixes for cross-browser compatibility
    autoprefixer: {},
  },
}
