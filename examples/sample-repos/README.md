# Sample Repositories

This directory contains sample code repositories for testing and demonstrating CodeCompass analysis capabilities.

## Available Samples

### 1. Sample TypeScript Project (`sample-ts-project/`)

A TypeScript/Express.js REST API demonstrating:
- **Language**: TypeScript with strict mode
- **Framework**: Express.js
- **Architecture**: Service layer, middleware pattern, repository pattern
- **Files**: 8 source files across 5 directories
- **Complexity**: Medium - good for testing multi-file analysis
- **Features**:
  - User CRUD operations
  - Authentication middleware
  - Database abstraction layer
  - Structured logging
  - Type-safe interfaces

**Best for testing:**
- TypeScript type extraction
- Import/export dependency tracking
- Class and interface analysis
- Function call graphs
- Layered architecture visualization

### 2. Sample Python Project (`sample-python-project/`)

A Python/Flask REST API demonstrating:
- **Language**: Python 3 with type hints
- **Framework**: Flask
- **Architecture**: Service layer, decorator pattern, repository pattern
- **Files**: 5 source files across 4 directories
- **Complexity**: Medium - similar structure to TypeScript project
- **Features**:
  - User CRUD operations
  - Authentication decorators
  - Database abstraction layer
  - Python logging module
  - Type hints throughout

**Best for testing:**
- Python import analysis
- Decorator pattern detection
- Class method extraction
- Cross-language comparison
- Flask routing pattern recognition

## Using These Samples

### With the Web Dashboard

1. Start CodeCompass: `npm run dev`
2. Navigate to the repository setup page
3. Enter the path: `/path/to/codecompass/examples/sample-repos/sample-ts-project`
4. Click "Analyze Repository"

### With the CLI

```bash
# Analyze TypeScript project
npm run cli analyze examples/sample-repos/sample-ts-project

# Analyze Python project
npm run cli analyze examples/sample-repos/sample-python-project

# Ask questions about the code
npm run cli chat "Where is user authentication handled?"
```

### With VS Code Extension

1. Open a sample project folder in VS Code
2. The CodeCompass extension will automatically detect it
3. Hover over functions to see AI-generated explanations
4. Use the sidebar to explore architecture

## What to Look For

When testing with these samples, verify:

1. **Dependency Analysis**
   - Imports/exports are correctly tracked
   - Dependency graph shows relationships
   - Circular dependencies detected (there are none in these samples)

2. **Architecture Visualization**
   - Service layer is identified
   - Middleware/decorators are shown
   - Database layer is separate
   - Similar patterns recognized across languages

3. **Code Understanding**
   - AI can explain what each file does
   - Function purposes are clear
   - Patterns are identified correctly
   - Similar code across projects is noted

4. **Learning Paths**
   - Suggests starting with main entry points (app.py, index.ts)
   - Identifies core vs. utility files
   - Recommends reading order
   - Estimates time to understand

## Adding More Samples

To add new sample repositories:

1. Create a new directory: `examples/sample-repos/your-project/`
2. Add real, working code (not stubs)
3. Include a README explaining the project
4. Cover a different language or pattern
5. Keep it medium complexity (5-15 files)
6. Update this README with the new sample

Good candidates for future samples:
- Go microservice
- Rust CLI tool
- Java Spring Boot API
- React frontend application
- Vue.js single-page app
