import { DatabaseClient } from '../database/client';
import { User, CreateUserDto } from '../types/user';

export class UserService {
  private db: DatabaseClient;

  constructor() {
    this.db = new DatabaseClient();
  }

  async getAllUsers(): Promise<User[]> {
    return this.db.query('SELECT * FROM users');
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const user: User = {
      id: this.generateId(),
      email: data.email,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.execute(
      'INSERT INTO users (id, email, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.email, user.name, user.createdAt, user.updatedAt]
    );

    return user;
  }

  async updateUser(id: string, data: Partial<CreateUserDto>): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    const updated = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };

    await this.db.execute(
      'UPDATE users SET email = ?, name = ?, updatedAt = ? WHERE id = ?',
      [updated.email, updated.name, updated.updatedAt, id]
    );

    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
