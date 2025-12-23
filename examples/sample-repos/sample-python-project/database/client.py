"""
Database client abstraction
"""
from typing import List, Dict, Any
from utils.logger import logger


class DatabaseClient:
    """Mock database client for testing"""

    def __init__(self):
        self.connected = False
        self._connect()

    def _connect(self):
        """Establish database connection"""
        logger.info('Connecting to database...')
        # Mock connection
        self.connected = True
        logger.info('Database connected successfully')

    def query(self, sql: str, params: List[Any] = None) -> List[Dict]:
        """Execute SELECT query"""
        if not self.connected:
            raise Exception('Database not connected')

        logger.debug(f'Executing query: {sql}', extra={'params': params or []})
        # Mock query execution
        return []

    def execute(self, sql: str, params: List[Any] = None) -> Dict:
        """Execute INSERT/UPDATE/DELETE statement"""
        if not self.connected:
            raise Exception('Database not connected')

        logger.debug(f'Executing statement: {sql}', extra={'params': params or []})
        # Mock execution
        return {'affected_rows': 1}

    def close(self):
        """Close database connection"""
        logger.info('Closing database connection')
        self.connected = False
