/**
 * Input Validation Schemas
 * 
 * Zod schemas for validating API request bodies
 */

import { z } from 'zod';

/**
 * AI Analysis Request Schema
 */
export const analyzeRequestSchema = z.object({
  code: z.string()
    .min(1, 'Code cannot be empty')
    .max(50000, 'Code is too long (max 50,000 characters)'),
  question: z.string()
    .max(1000, 'Question is too long (max 1,000 characters)')
    .optional(),
  language: z.string()
    .max(50, 'Language name is too long')
    .optional(),
  type: z.enum(['analyze', 'explain'])
    .default('analyze'),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

/**
 * Repository Clone Request Schema
 */
export const cloneRequestSchema = z.object({
  url: z.string()
    .url('Invalid repository URL')
    .regex(/^https:\/\/(github\.com|gitlab\.com|bitbucket\.org)\//, 
      'Only GitHub, GitLab, and Bitbucket URLs are supported'),
  branch: z.string()
    .max(100, 'Branch name is too long')
    .optional(),
});

export type CloneRequest = z.infer<typeof cloneRequestSchema>;

/**
 * Note Creation Request Schema
 */
export const createNoteSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long (max 200 characters)'),
  content: z.string()
    .min(1, 'Content is required')
    .max(10000, 'Content is too long (max 10,000 characters)'),
  tags: z.array(z.string().max(50))
    .max(10, 'Too many tags (max 10)')
    .optional(),
  repositoryPath: z.string()
    .max(500, 'Repository path is too long')
    .optional(),
});

export type CreateNote = z.infer<typeof createNoteSchema>;

/**
 * Annotation Creation Request Schema
 */
export const createAnnotationSchema = z.object({
  filePath: z.string()
    .min(1, 'File path is required')
    .max(500, 'File path is too long'),
  lineNumber: z.number()
    .int('Line number must be an integer')
    .positive('Line number must be positive'),
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content is too long (max 5,000 characters)'),
  type: z.enum(['comment', 'question', 'suggestion', 'issue'])
    .default('comment'),
  repositoryPath: z.string()
    .max(500, 'Repository path is too long')
    .optional(),
});

export type CreateAnnotation = z.infer<typeof createAnnotationSchema>;

/**
 * Settings Update Request Schema
 */
export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  fontSize: z.number()
    .min(12, 'Font size too small')
    .max(24, 'Font size too large')
    .optional(),
  autoSave: z.boolean().optional(),
  notifications: z.boolean().optional(),
  analyticsEnabled: z.boolean().optional(),
});

export type UpdateSettings = z.infer<typeof updateSettingsSchema>;

/**
 * Search Request Schema
 */
export const searchRequestSchema = z.object({
  query: z.string()
    .min(1, 'Search query cannot be empty')
    .max(500, 'Search query is too long'),
  type: z.enum(['files', 'notes', 'annotations', 'all'])
    .default('all'),
  repositoryPath: z.string()
    .max(500, 'Repository path is too long')
    .optional(),
  limit: z.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit too high (max 100)')
    .default(20),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

/**
 * Validate request body against schema
 * Returns parsed data or throws validation error
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns result object instead of throwing
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
