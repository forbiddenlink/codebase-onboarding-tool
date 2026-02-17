# CodeCompass - AI-Powered Codebase Onboarding Platform

> **Make joining new codebases 10x faster** with AI-powered Q&A, interactive architecture diagrams, personalized learning paths, and intelligent code annotations.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 Features

### Core Capabilities

- 🤖 **AI-Powered Codebase Chat** - Natural language Q&A about your codebase using Claude AI with RAG
- 📊 **Interactive Architecture Diagrams** - Auto-generated, zoomable dependency graphs and call trees
- 🎯 **Personalized Learning Paths** - Role-based onboarding tracks (Backend, Frontend, Full-Stack, DevOps)
- 💡 **Inline Code Annotations** - Intelligent tooltips and team-sourced knowledge directly in code
- 🚀 **Runnable Examples Generator** - Auto-created minimal examples that run in isolation
- 👥 **Team Knowledge Extraction** - Mine git history for experts, patterns, and tribal knowledge
- 📈 **Onboarding Progress Dashboard** - Track learning progress and time-to-first-PR

### Multi-Interface Access

- 🌐 **Web Dashboard** - Full-featured visual interface
- 💻 **CLI Tool** - Quick queries from terminal
- 🔌 **VS Code Extension** - Hover tooltips and inline annotations
- 💬 **Slack Bot** (Coming soon) - Query from team chat

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Git** installed and configured
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd codecompass

# Run the setup script (handles everything!)
./init.sh
```

The init script will:
1. Check prerequisites
2. Install all dependencies
3. Setup database with Prisma
4. Create `.env` from template
5. Start the development server

### Manual Setup

If you prefer manual setup:

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Initialize database
cd packages/web
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# 4. Start development server
npm run dev
```

### Access the Application

- **Web Dashboard**: http://localhost:3000
- **CLI Tool**: `npm run cli` (after building)
- **VS Code Extension**: Open `packages/vscode-extension` in VS Code and press F5

## 📁 Project Structure

```
codecompass/
├── packages/
│   ├── web/                  # Next.js web dashboard (port 3000)
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities and helpers
│   │   └── prisma/           # Database schema and migrations
│   ├── cli/                  # Command-line interface
│   │   ├── src/              # CLI source code
│   │   └── bin/              # Executable scripts
│   ├── analyzer/             # Core code analysis engine (shared)
│   │   ├── src/
│   │   │   ├── parsers/      # Language parsers (tree-sitter)
│   │   │   ├── graph/        # Dependency and call graph builders
│   │   │   └── ai/           # AI integration (Claude API)
│   │   └── tests/            # Unit tests
│   ├── vscode-extension/     # VS Code extension
│   │   ├── src/              # Extension code
│   │   └── webview/          # React-based UI panels
│   └── shared/               # Shared types and utilities
├── examples/
│   └── sample-repos/         # Test repositories
├── feature_list.json         # Complete test suite (200+ tests)
├── init.sh                   # Quick setup script
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.1.6** with App Router and TypeScript
- **Tailwind CSS** with **Ethereal Cyber-Glass** design system
- **Framer Motion** for advanced layout animations (scanlines, holographic effects)
- **shadcn/ui** components (customized)
- **D3.js** for interactive visualizations
- **Zustand** for UI state

### Backend
- **Next.js API Routes** and Server Actions
- **SQLite** with **Prisma ORM**
- **Anthropic Claude API** (Sonnet 3.5) for AI features
- **tree-sitter** for multi-language parsing
- **simple-git** for repository analysis

### Security
- **Next.js 16.1.6** (Latest security patches)
- **Content Security Policy** (CSP) optimized for animations
- **Input Sanitization** with Zod and DOMPurify
- **Rate Limiting** via Upstash Redis


### Rate Limiting
Multi-tier rate limiting powered by Upstash Redis:
- **AI Endpoints**: 10 requests/minute (prevents API abuse)
- **Authentication**: 5 requests/minute (brute force protection)
- **Repository Operations**: 30 requests/minute
- **General API**: 60 requests/minute

### CSRF Protection
- **Origin Validation** - POST/PUT/DELETE/PATCH requests validated against trusted origins
- **SameSite Cookies** - Cookie-based sessions with SameSite=Lax/Strict
- **Referer Header Validation** - Fallback validation for older browsers

### Performance & Cost Optimization
- **AI Response Caching** - Redis-backed cache with intelligent TTLs:
  - Code explanations: 7 days
  - Code analysis: 1 day
  - Suggestions: 1 hour
- **Estimated 60-70% cache hit rate** = ~70% reduction in AI API costs
- **In-memory fallback** - Works without Redis in development

### Environment Security
- **Startup Validation** - Zod-based environment variable validation with fail-fast
- **Secret Management** - 32+ character SESSION_SECRET generation
- **Type-safe Configuration** - Environment-specific configs with feature flags

### Setup Instructions

1. **Generate Session Secret**:
```bash
openssl rand -base64 32
```

2. **Configure Environment Variables** (`.env`):
```env
# Required
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=sk-ant-xxxxx
SESSION_SECRET=<your-generated-secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Recommended for Production
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
NODE_ENV=production
```

3. **Enable HSTS in Production** (`next.config.js`):
```javascript
// Uncomment in next.config.js after SSL certificate setup
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
```

### Security Testing

Run the security test suite:
```bash
# Check for XSS vulnerabilities
npm run test:security

# Verify rate limiting
npm run test:rate-limit

# Audit dependencies
npm audit

# Check for CSRF protection
npm run test:csrf
```

See [SECURITY_FIXES_SUMMARY.md](SECURITY_FIXES_SUMMARY.md) for detailed security implementation documentation.

## �📖 Usage Guide

### Analyzing a Repository

#### Via Web Interface
1. Navigate to http://localhost:3000
2. Click "Add Repository"
3. Enter local path or git URL
4. Wait for analysis (2-5 minutes for typical projects)
5. Explore via chat, diagrams, or learning paths

#### Via CLI
```bash
# Analyze local repository
codecompass analyze /path/to/repo

# Ask questions
codecompass ask "where is authentication?"

# Generate onboarding report
codecompass report --format markdown
```

### Using the AI Chat

**Example Questions:**
- "Where is authentication handled in this codebase?"
- "How does data flow from the API to the frontend?"
- "What calls the `processPayment` function?"
- "Show me all files related to user management"
- "What are the main architectural patterns used here?"

### Creating a Learning Path

1. Complete repository analysis
2. Navigate to "Learning Paths"
3. Select your role (Backend/Frontend/Full-Stack/DevOps)
4. System generates personalized curriculum
5. Follow the guided path with estimated times
6. Take quizzes to test understanding
7. Track your progress on the dashboard

### Using VS Code Extension

1. Install the extension (F5 in extension dev mode)
2. Open a workspace with analyzed repository
3. Hover over functions to see AI-generated explanations
4. View sidebar panel for repository overview
5. Add annotations that your team can share

## 🧪 Testing

The project includes 200+ comprehensive test cases defined in `feature_list.json`.

```bash
# Run all tests
npm test

# Run tests for specific package
npm test -w analyzer

# Run specific test suite
npm test -w web -- --grep "chat"

# Check test coverage
npm run test:coverage
```

## 🏗️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start all services in development mode
npm run dev -w web       # Start only web dashboard
npm run dev -w cli       # Start CLI in watch mode

# Building
npm run build            # Build all packages
npm run build -w web     # Build only web dashboard

# Code Quality
npm run lint             # Run ESLint on all packages
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Database
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio (DB GUI)
npm run db:seed          # Seed database with test data

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Required
DATABASE_URL="file:./dev.db"                # SQLite for dev, PostgreSQL for prod
ANTHROPIC_API_KEY=sk-ant-xxxxx              # Get from https://console.anthropic.com
SESSION_SECRET=<generate-with-openssl>       # 32+ characters (see Security section)
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Your app URL (for CORS/CSRF)

# Recommended for Production
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io  # Redis for rate limiting & caching
UPSTASH_REDIS_REST_TOKEN=xxxxx                 # Get from https://upstash.com
NODE_ENV=production

# Optional: GitHub Integration
GITHUB_TOKEN=ghp_xxxxx                      # For private repo cloning

# Optional: Legacy Configuration
NEXTAUTH_SECRET=<same-as-SESSION_SECRET>    # For backward compatibility
NEXTAUTH_URL=http://localhost:3000
```

**Security Notes:**
- Generate `SESSION_SECRET` with: `openssl rand -base64 32`
- Never commit `.env` to version control
- Rotate secrets every 90 days in production
- Use environment-specific `.env.production` and `.env.development` files

## 🎯 Roadmap

### Current Status
- ✅ Project structure defined (monorepo with workspaces)
- ✅ Feature list created (200+ comprehensive tests)
- ✅ Development environment fully configured
- ✅ Core architecture implemented
- ✅ **Redesign Complete**: "Ethereal Cyber-Glass" UI with Bento Grids & Neon Aesthetics
- ✅ Repository analysis engine (TypeScript/JavaScript parsing with tree-sitter)
- ✅ Web dashboard with modern UI (Next.js 14 + Tailwind + shadcn/ui)
- ✅ AI chat integration with Claude API
- ✅ Database layer with Prisma ORM
- ✅ Basic CLI tool structure


### In Progress
- ⏳ Dependency graph visualization with D3.js
- ⏳ Learning path generation algorithm
- ⏳ Vector search for semantic code queries
- ⏳ Command palette for quick actions
- ⏳ Notification system

### Next Steps
- [ ] Complete graph visualization features
- [ ] Implement runnable examples generator
- [ ] Team knowledge extraction from git history
- [ ] Progress tracking dashboard
- [ ] VS Code extension completion (hover tooltips, annotations)
- [ ] CLI enhancement with rich terminal output

### Future Features
- Slack bot integration
- Browser extension for GitHub/GitLab
- Jira/Linear integration for tracking onboarding tasks
- AI-generated video walkthroughs
- Confluence/Notion documentation export
- Performance hotspot identification
- Multi-language support (Python, Java, Go, Rust)

## 🤝 Contributing

This is a production-quality portfolio project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new features (aim for 80% coverage)
- Use conventional commits
- Update feature_list.json when adding features
- Ensure all tests pass before submitting PR

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [Anthropic Claude](https://www.anthropic.com/) for AI capabilities
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Visualization powered by [D3.js](https://d3js.org/)
- Code parsing with [tree-sitter](https://tree-sitter.github.io/)

## 📞 Support

- 📧 Email: support@codecompass.dev
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/codecompass/issues)
- 📖 Docs: [Full Documentation](#)

---

**Made with ❤️ by the CodeCompass team**

*Helping developers onboard faster, one codebase at a time.*
