"""
Main Flask application entry point
"""
from flask import Flask, jsonify, request
from services.user_service import UserService
from middleware.auth import require_auth
from utils.logger import logger
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Initialize services
user_service = UserService()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info('Health check requested')
    return jsonify({
        'status': 'ok',
        'service': 'sample-python-api',
        'version': '1.0.0'
    })


@app.route('/api/users', methods=['GET'])
@require_auth
def get_users():
    """Get all users"""
    try:
        users = user_service.get_all_users()
        return jsonify(users)
    except Exception as e:
        logger.error(f'Error fetching users: {e}')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/users/<user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    """Get user by ID"""
    try:
        user = user_service.get_user_by_id(user_id)
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user)
    except Exception as e:
        logger.error(f'Error fetching user {user_id}: {e}')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/users', methods=['POST'])
@require_auth
def create_user():
    """Create new user"""
    try:
        data = request.get_json()
        user = user_service.create_user(data)
        logger.info(f'User created: {user["id"]}')
        return jsonify(user), 201
    except ValueError as e:
        logger.warning(f'Invalid user data: {e}')
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Error creating user: {e}')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/users/<user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    """Update user"""
    try:
        data = request.get_json()
        user = user_service.update_user(user_id, data)
        if user is None:
            return jsonify({'error': 'User not found'}), 404
        logger.info(f'User updated: {user_id}')
        return jsonify(user)
    except ValueError as e:
        logger.warning(f'Invalid user data: {e}')
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Error updating user {user_id}: {e}')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/users/<user_id>', methods=['DELETE'])
@require_auth
def delete_user(user_id):
    """Delete user"""
    try:
        success = user_service.delete_user(user_id)
        if not success:
            return jsonify({'error': 'User not found'}), 404
        logger.info(f'User deleted: {user_id}')
        return '', 204
    except Exception as e:
        logger.error(f'Error deleting user {user_id}: {e}')
        return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    logger.info(f'Starting Flask application on port {port}')
    app.run(host='0.0.0.0', port=port, debug=debug)
