# Sample TypeScript Project

This is a sample TypeScript/Express API project for testing CodeCompass analysis capabilities.

## Features

- RESTful API with Express
- TypeScript with strict mode
- User management service
- Authentication middleware
- Database client abstraction
- Structured logging

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── services/
│   └── userService.ts    # User business logic
├── middleware/
│   └── auth.ts           # Authentication middleware
├── database/
│   └── client.ts         # Database client
├── types/
│   └── user.ts           # Type definitions
└── utils/
    └── logger.ts         # Logging utility
```

## Architecture Patterns

- **Service Layer**: Business logic separated into services
- **Middleware Pattern**: Authentication and request processing
- **Repository Pattern**: Database abstraction via DatabaseClient
- **Dependency Injection**: Services receive dependencies via constructor

## Testing CodeCompass

This project is ideal for testing:
1. Multi-file dependency analysis
2. Import/export tracking
3. Function call graph generation
4. TypeScript type extraction
5. Architecture diagram visualization
6. Learning path generation

## Installation

```bash
npm install
npm run build
npm start
```

## API Endpoints

- `GET /health` - Health check (no auth required)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
