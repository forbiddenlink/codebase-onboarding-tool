# Contributing to CodeCompass

Thank you for your interest in contributing to CodeCompass! This document provides guidelines and instructions for contributing to the project.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/codecompass.git
   cd codecompass
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY to .env
   ```
5. **Run database migrations**
   ```bash
   cd packages/web
   npx prisma generate
   npx prisma db push
   cd ../..
   ```
6. **Start development**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### Before You Start

1. Check existing issues and PRs to avoid duplicate work
2. For major changes, open an issue first to discuss your idea
3. Ensure you're working on the `main` branch or create a feature branch

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Write tests for new features
   - Update documentation as needed

3. **Run checks**
   ```bash
   npm run lint              # Check code style
   npm run type-check        # TypeScript validation
   npm test                  # Run test suite
   npm run format            # Format code
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference related issues
   - Include screenshots for UI changes

## 🏗️ Project Structure

```
codecompass/
├── packages/
│   ├── web/          # Next.js web application
│   ├── cli/          # Command-line interface
│   ├── analyzer/     # Core analysis engine
│   ├── shared/       # Shared types and utilities
│   └── vscode-extension/  # VS Code extension
├── examples/         # Sample repositories for testing
└── docs/            # Additional documentation
```

## 🧪 Testing Guidelines

- **Write tests for new features** - Aim for 80%+ coverage
- **Test files** - Place next to source files with `.test.ts` extension
- **Run tests locally** before submitting PR
- **Update feature_list.json** when adding new capabilities

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test -w analyzer

# Watch mode
npm run test:watch -w web

# Coverage report
npm run test:coverage
```

## 📝 Code Style

### TypeScript

- Use **TypeScript strict mode**
- Prefer **interfaces** over types for object shapes
- Use **explicit return types** for functions
- Avoid `any` - use proper types or `unknown`

### React

- Use **functional components** with hooks
- Keep components **small and focused**
- Extract reusable logic into **custom hooks**
- Use **Server Components** by default (mark with 'use client' when needed)

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: kebab-case (`user-service.ts`) or PascalCase for components
- **Variables/Functions**: camelCase (`getUserById`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`UserData`, `ApiResponse`)

## 🎨 UI/UX Guidelines

- Follow the existing **coral/amber/teal design system**
- Use **shadcn/ui components** when possible
- Ensure **responsive design** (mobile, tablet, desktop)
- Test **dark mode** compatibility
- Add **loading states** and **error handling**
- Include **accessibility** features (ARIA labels, keyboard navigation)

## 📚 Documentation

- **Update README.md** for user-facing changes
- **Add JSDoc comments** for complex functions
- **Update CHANGELOG.md** following Keep a Changelog format
- **Include code examples** for new features

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description** - Clear, concise summary
2. **Steps to reproduce** - Detailed steps
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - OS, Node version, browser
6. **Screenshots** - If applicable
7. **Error logs** - Console output, stack traces

## 💡 Feature Requests

For feature requests:

1. **Check existing issues** first
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with details
4. **Consider alternatives** you've thought about
5. **Show examples** from similar tools (if any)

## 🔍 Code Review Process

- All PRs require **at least one review**
- Address **review comments** promptly
- Keep PRs **focused and reasonably sized**
- Respond to feedback **constructively**
- Update your PR based on feedback

## 📄 License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

## 🙏 Recognition

Contributors are recognized in:
- GitHub contributors page
- Project README (for significant contributions)
- Release notes

## ❓ Questions?

- **Discord**: [Join our community](#)
- **Issues**: Use GitHub issues for questions
- **Email**: support@codecompass.dev

---

**Happy Contributing! 🎉**

We appreciate your time and effort in making CodeCompass better!
