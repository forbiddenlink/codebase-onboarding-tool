# CodeCompass Configuration Guide

This document explains all configuration files in the CodeCompass project and their purpose.

## Root Configuration Files

### `package.json` (Root)
**Purpose**: Root package.json for the CodeCompass monorepo
**Key Features**:
- **Workspaces**: Manages monorepo structure with `packages/*`
- **Scripts**: Root-level commands that cascade to workspace packages
  - `dev`: Starts all workspace development servers
  - `build`: Builds all workspace packages for production
  - `lint`: Runs ESLint across all packages
  - `test`: Runs tests in all packages
  - `format`: Formats code with Prettier
  - `db:migrate`: Runs database migrations
  - `clean`: Removes all node_modules and build artifacts
- **Engines**: Requires Node.js 18+ and npm 9+
- **Dev Dependencies**: Shared tools (TypeScript, ESLint, Prettier, Husky)

**Important Settings**:
- `private: true` - Prevents accidental publishing to npm
- `workspaces: ["packages/*"]` - Enables npm workspace mode
- All workspace scripts use `--workspaces --if-present` flag

---

### `tsconfig.json` (Root)
**Purpose**: Base TypeScript configuration for the entire project
**Key Features**:
- **Target**: ES2020 for modern JavaScript features
- **Strict Mode**: All strictness flags enabled for type safety
  - `strict: true` - Master strict flag
  - `noImplicitAny: true` - Requires explicit types
  - `strictNullChecks: true` - Prevents null/undefined errors
  - `noUnusedLocals: true` - Catches unused variables
  - `noUnusedParameters: true` - Catches unused function parameters
  - `noImplicitReturns: true` - Requires return statements
- **Module System**: CommonJS for Node.js compatibility
- **Output**: Generates declaration files (.d.ts) and source maps
- **Exclusions**: Ignores node_modules, dist, .next, out directories

**Why These Settings**:
- Strict mode catches bugs at compile time
- Declaration files enable TypeScript in consuming packages
- Source maps enable debugging of compiled code

---

### `.eslintrc.json` (Root)
**Purpose**: ESLint configuration for code quality and consistency
**Key Features**:
- **Parser**: `@typescript-eslint/parser` for TypeScript support
- **Extends**:
  - `eslint:recommended` - Core ESLint rules
  - `plugin:@typescript-eslint/recommended` - TypeScript-specific rules
  - `prettier` - Disables conflicting formatting rules
- **Rules**:
  - `@typescript-eslint/no-explicit-any: "warn"` - Warns on `any` usage (not error to allow gradual typing)
  - `@typescript-eslint/no-unused-vars: "warn"` - Warns on unused variables (ignores variables starting with `_`)
  - `no-console: "off"` - Allows console logs (useful for debugging and CLI output)
- **Environment**: Node.js with ES2022 features

**Why These Settings**:
- Balances strictness with developer productivity
- Integrates with Prettier to avoid formatting conflicts
- Allows console.log for legitimate logging needs

---

## Web Package Configuration Files

### `packages/web/package.json`
**Purpose**: Configuration for the Next.js web dashboard
**Key Dependencies**:
- **Framework**: Next.js 14+ with React 18+
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: Zustand for UI state, React Query for server state
- **Database**: Prisma ORM with SQLite
- **AI**: Anthropic Claude SDK
- **Animations**: Framer Motion
- **Code Display**: Shiki for syntax highlighting

**Scripts**:
- `dev`: Starts Next.js development server on port 3000
- `build`: Creates optimized production build
- `start`: Serves production build
- `lint`: Runs Next.js linting
- `type-check`: Validates TypeScript types
- `db:*`: Database management commands

---

### `packages/web/next.config.js`
**Purpose**: Next.js framework configuration
**Key Settings**:

```javascript
reactStrictMode: true
```
- Enables React's strict mode for highlighting potential problems
- Helps identify unsafe lifecycle methods and deprecated APIs

```javascript
transpilePackages: ['@codecompass/analyzer', '@codecompass/shared']
```
- Transpiles TypeScript packages from the monorepo
- Required for importing local workspace packages

```javascript
experimental.serverActions.bodySizeLimit: '2mb'
```
- Increases upload size limit for server actions
- Allows larger repository files to be processed

```javascript
images.domains: ['localhost']
```
- Whitelists localhost for Next.js Image Optimization
- Add production domains here when deploying

**Why These Settings**:
- Optimized for monorepo structure with multiple packages
- Configured for development with local data
- Ready for production deployment with minor adjustments

---

### `packages/web/tsconfig.json`
**Purpose**: TypeScript configuration for Next.js app
**Key Settings**:

```json
"extends": "../../tsconfig.json"
```
- Inherits strict mode settings from root config

```json
"lib": ["ES2020", "DOM", "DOM.Iterable"]
```
- Includes browser APIs (DOM) in addition to ES2020

```json
"jsx": "preserve"
```
- Preserves JSX for Next.js to handle transformation

```json
"module": "esnext", "moduleResolution": "bundler"
```
- Uses latest module system compatible with Next.js bundler

```json
"noEmit": true
```
- Doesn't generate JavaScript files (Next.js handles compilation)

```json
"paths": { "@/*": ["./*"] }
```
- Enables `@/` imports for cleaner relative imports
- Example: `import { Header } from '@/components/Header'`

**Why These Settings**:
- Optimized for Next.js App Router
- Enables modern import patterns
- Maintains type safety from root config

---

### `packages/web/tailwind.config.js`
**Purpose**: Tailwind CSS configuration for styling
**Key Settings**:

```javascript
darkMode: ["class"]
```
- Enables dark mode via CSS class (`.dark`)
- Allows runtime theme switching

```javascript
content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}']
```
- Scans these directories for Tailwind classes
- Enables tree-shaking (only includes used classes)

```javascript
theme.extend.colors
```
- Uses CSS variables for theming: `hsl(var(--primary))`
- Allows dynamic theme changes without rebuilding
- Includes shadcn/ui color palette (primary, secondary, muted, etc.)

```javascript
theme.extend.borderRadius
```
- Uses CSS variable `--radius` for consistent corner rounding
- Enables theme-wide border radius adjustments

```javascript
theme.extend.keyframes & animation
```
- Defines accordion animations for expandable components
- Smooth 0.2s ease-out transitions

```javascript
plugins: [require("tailwindcss-animate")]
```
- Adds utility classes for animations
- Powers smooth transitions throughout the app

**Why These Settings**:
- Supports light/dark theme switching
- Integrates with shadcn/ui component library
- Optimized bundle size through content scanning
- Professional animations and interactions

---

### `packages/web/postcss.config.js`
**Purpose**: PostCSS configuration for CSS processing
**Key Plugins**:

```javascript
tailwindcss: {}
```
- Processes Tailwind directives (`@tailwind base`, `@apply`, etc.)
- Generates utility classes from config

```javascript
autoprefixer: {}
```
- Adds vendor prefixes automatically (-webkit, -moz, etc.)
- Ensures cross-browser compatibility
- Uses browserslist data for target browsers

**Why These Settings**:
- Minimal configuration (both plugins use defaults)
- Essential for Tailwind CSS workflow
- Autoprefixer ensures compatibility with older browsers

---

### `packages/web/.eslintrc.json`
**Purpose**: Additional ESLint rules specific to Next.js
**Key Settings**:

```json
"extends": ["next/core-web-vitals"]
```
- Adds Next.js-specific linting rules
- Enforces performance best practices
- Validates proper use of Next.js features (Image, Link, etc.)

**Why These Settings**:
- Catches Next.js-specific issues
- Ensures performance optimization
- Complements root ESLint config

---

## Configuration Best Practices

### Adding New Dependencies
1. Install at workspace root: `npm install -w <package-name> <dependency>`
2. Or navigate to package: `cd packages/web && npm install <dependency>`
3. Shared dev tools should go in root `devDependencies`

### Modifying TypeScript Settings
1. Global changes: Edit root `tsconfig.json`
2. Package-specific changes: Edit `packages/*/tsconfig.json`
3. Always keep `strict: true` enabled

### Updating Tailwind Theme
1. Edit `packages/web/tailwind.config.js`
2. Add custom colors/spacing/fonts in `theme.extend`
3. Use CSS variables for dynamic theming

### Adding New Scripts
1. Root scripts: Add to root `package.json` with `--workspaces` flag
2. Package scripts: Add to specific package's `package.json`
3. Use descriptive names and follow existing patterns

---

## Environment Variables

Configuration that should NOT be in config files (use `.env` instead):

- `ANTHROPIC_API_KEY` - Claude API key
- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_*` - Public environment variables for browser

See `.env.example` for required variables.

---

## Production Deployment

Before deploying to production:

1. **Next.js Config**: Update `images.domains` with production domain
2. **Environment**: Set all required env vars in hosting platform
3. **Build**: Run `npm run build` to verify successful compilation
4. **Database**: Ensure production database is configured (PostgreSQL recommended)
5. **TypeScript**: Run `npm run type-check` to catch type errors

---

## Troubleshooting

### "Cannot find module '@/*'"
- Check `tsconfig.json` includes `paths` configuration
- Restart TypeScript server in editor

### Tailwind classes not working
- Verify file is in `content` array of `tailwind.config.js`
- Restart dev server

### Build errors
- Run `npm run type-check` to see TypeScript errors
- Run `npm run lint` to see linting issues
- Check all dependencies are installed: `npm install`

---

**Last Updated**: December 23, 2025
**Maintainer**: CodeCompass Team
