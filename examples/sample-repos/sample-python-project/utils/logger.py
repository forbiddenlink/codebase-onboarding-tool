"""
Logging utility
"""
import logging
import os
from datetime import datetime


# Configure logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()
LOG_FORMAT = '%(levelname)s - %(asctime)s - %(name)s - %(message)s'

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Create logger instance
logger = logging.getLogger('sample-python-api')


def log_request(request):
    """Log incoming request details"""
    logger.info(
        f'{request.method} {request.path}',
        extra={
            'ip': request.remote_addr,
            'user_agent': request.user_agent.string
        }
    )


def log_response(response, duration_ms):
    """Log outgoing response details"""
    logger.info(
        f'Response: {response.status_code} ({duration_ms}ms)',
        extra={'status': response.status_code}
    )
