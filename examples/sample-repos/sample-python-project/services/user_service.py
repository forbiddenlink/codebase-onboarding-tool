"""
User service - handles user business logic
"""
from typing import List, Dict, Optional
from datetime import datetime
import uuid
from database.client import DatabaseClient


class UserService:
    """Service for managing users"""

    def __init__(self):
        self.db = DatabaseClient()

    def get_all_users(self) -> List[Dict]:
        """Retrieve all users from database"""
        return self.db.query('SELECT * FROM users')

    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        users = self.db.query(
            'SELECT * FROM users WHERE id = ?',
            [user_id]
        )
        return users[0] if users else None

    def create_user(self, data: Dict) -> Dict:
        """Create a new user"""
        # Validate required fields
        if 'email' not in data or 'name' not in data:
            raise ValueError('Email and name are required')

        if not self._is_valid_email(data['email']):
            raise ValueError('Invalid email format')

        # Create user object
        user = {
            'id': self._generate_id(),
            'email': data['email'],
            'name': data['name'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
        }

        # Save to database
        self.db.execute(
            'INSERT INTO users (id, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [user['id'], user['email'], user['name'], user['created_at'], user['updated_at']]
        )

        return user

    def update_user(self, user_id: str, data: Dict) -> Optional[Dict]:
        """Update existing user"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        # Validate email if provided
        if 'email' in data and not self._is_valid_email(data['email']):
            raise ValueError('Invalid email format')

        # Update fields
        if 'email' in data:
            user['email'] = data['email']
        if 'name' in data:
            user['name'] = data['name']
        user['updated_at'] = datetime.utcnow().isoformat()

        # Save to database
        self.db.execute(
            'UPDATE users SET email = ?, name = ?, updated_at = ? WHERE id = ?',
            [user['email'], user['name'], user['updated_at'], user_id]
        )

        return user

    def delete_user(self, user_id: str) -> bool:
        """Delete user by ID"""
        result = self.db.execute('DELETE FROM users WHERE id = ?', [user_id])
        return result['affected_rows'] > 0

    def _generate_id(self) -> str:
        """Generate unique user ID"""
        return f'user_{uuid.uuid4().hex[:16]}'

    def _is_valid_email(self, email: str) -> bool:
        """Validate email format"""
        return '@' in email and '.' in email.split('@')[1]
