import { z } from 'zod';

// Zod schemas for validation

export const RepositorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  path: z.string().min(1),
  url: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastAnalyzed: z.date().optional(),
});

export const FileNodeSchema = z.object({
  id: z.string().uuid(),
  path: z.string().min(1),
  name: z.string().min(1),
  extension: z.string(),
  language: z.string(),
  size: z.number().nonnegative(),
  linesOfCode: z.number().nonnegative(),
  complexity: z.number().nonnegative(),
  lastModified: z.date(),
  primaryAuthor: z.string().optional(),
  repositoryId: z.string().uuid(),
});

export const ChatMessageSchema = z.object({
  repositoryId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export const AnalyzeRepositorySchema = z.object({
  path: z.string().min(1),
  url: z.string().url().optional(),
});

export const CreateAnnotationSchema = z.object({
  fileId: z.string().uuid(),
  lineNumber: z.number().positive(),
  content: z.string().min(1).max(1000),
});

export const LearningPathRoleSchema = z.enum([
  'backend',
  'frontend',
  'fullstack',
  'devops',
]);
