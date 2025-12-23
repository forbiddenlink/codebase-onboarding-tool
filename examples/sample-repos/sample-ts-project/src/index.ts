import express, { Request, Response } from 'express';
import { UserService } from './services/userService';
import { AuthMiddleware } from './middleware/auth';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(AuthMiddleware.validateToken);

// Initialize services
const userService = new UserService();

// Routes
app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    logger.info('User created:', user.id);
    res.status(201).json(user);
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

export default app;
