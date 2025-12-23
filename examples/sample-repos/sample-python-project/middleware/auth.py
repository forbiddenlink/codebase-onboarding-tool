"""
Authentication middleware
"""
from functools import wraps
from flask import request, jsonify
from utils.logger import logger


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get authorization header
        auth_header = request.headers.get('Authorization', '')

        if not auth_header:
            logger.warning(f'Request without token: {request.path}')
            return jsonify({'error': 'Authentication required'}), 401

        # Extract token
        token = auth_header.replace('Bearer ', '')

        # Simple token validation (in production, use proper JWT verification)
        if len(token) < 20:
            logger.warning('Invalid token format')
            return jsonify({'error': 'Invalid token'}), 401

        # Token is valid, continue
        return f(*args, **kwargs)

    return decorated_function


def require_admin(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # This would check the user's role from the token
        # For now, it's a placeholder
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '')

        # Mock admin check
        if not token.startswith('admin_'):
            logger.warning('Non-admin access attempt')
            return jsonify({'error': 'Admin access required'}), 403

        return f(*args, **kwargs)

    return decorated_function
