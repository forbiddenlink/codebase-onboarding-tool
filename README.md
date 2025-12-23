# CodeCompass - AI-Powered Codebase Onboarding Platform

> **Make joining new codebases 10x faster** with AI-powered Q&A, interactive architecture diagrams, personalized learning paths, and intelligent code annotations.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
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
- **Next.js 14+** with App Router and TypeScript
- **Tailwind CSS** with **shadcn/ui** components
- **D3.js** for interactive visualizations
- **Zustand** for UI state, **React Query** for server state
- **Framer Motion** for animations

### Backend
- **Next.js API Routes** and Server Actions
- **SQLite** with **Prisma ORM** (upgradeable to PostgreSQL)
- **Anthropic Claude API** (Sonnet 4) for AI features
- **tree-sitter** for multi-language parsing
- **simple-git** for repository analysis
- **In-memory vector store** (FAISS) for semantic search

### CLI & Extension
- **Commander.js** for CLI
- **VS Code Extension API**
- **Chalk** and **Ora** for beautiful terminal output

## 📖 Usage Guide

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
# Required: Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Database (SQLite default, or PostgreSQL URL)
DATABASE_URL="file:./dev.db"

# Optional: Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Optional: Feature Flags
ENABLE_SLACK_BOT=false
ENABLE_ADVANCED_ANALYSIS=true
```

## 🎯 Roadmap

### Current Status (Session 1)
- ✅ Project structure defined
- ✅ Feature list created (200+ tests)
- ✅ Development environment setup
- ⏳ Core architecture implementation (in progress)

### Next Steps
- [ ] Repository analysis engine (TypeScript/JavaScript parsing)
- [ ] Web dashboard basic UI
- [ ] AI chat integration with Claude API
- [ ] Dependency graph visualization
- [ ] Learning path generation
- [ ] CLI tool implementation
- [ ] VS Code extension development

### Future Features
- Browser extension for GitHub/GitLab
- Jira/Linear integration
- AI-generated video walkthroughs
- Confluence/Notion export
- Performance hotspot identification

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
