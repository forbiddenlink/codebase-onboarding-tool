# Sample Python Project

This is a sample Python/Flask API project for testing CodeCompass analysis capabilities.

## Features

- RESTful API with Flask
- User management service
- Authentication middleware (decorators)
- Database client abstraction
- Structured logging with Python logging module
- Type hints throughout

## Project Structure

```
.
├── app.py                    # Main Flask application
├── services/
│   └── user_service.py       # User business logic
├── middleware/
│   └── auth.py               # Authentication decorators
├── database/
│   └── client.py             # Database client
└── utils/
    └── logger.py             # Logging configuration
```

## Architecture Patterns

- **Service Layer**: Business logic in separate service classes
- **Decorator Pattern**: Authentication via function decorators
- **Repository Pattern**: Database abstraction via DatabaseClient
- **Dependency Injection**: Services initialized in main app

## Testing CodeCompass

This project is ideal for testing:
1. Python import/module analysis
2. Function decorator tracking
3. Class method analysis
4. Type hint extraction
5. Cross-language comparison with TypeScript sample
6. Flask routing pattern detection

## Installation

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running

```bash
python app.py
```

## API Endpoints

- `GET /health` - Health check (no auth required)
- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/<id>` - Get user by ID (requires auth)
- `POST /api/users` - Create new user (requires auth)
- `PUT /api/users/<id>` - Update user (requires auth)
- `DELETE /api/users/<id>` - Delete user (requires auth)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `DEBUG` - Debug mode (default: True)
- `LOG_LEVEL` - Logging level (default: INFO)
- `SECRET_KEY` - Flask secret key
