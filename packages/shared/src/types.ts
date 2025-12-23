// Core types for CodeCompass

export interface Repository {
  id: string;
  name: string;
  path: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAnalyzed?: Date;
}

export interface FileNode {
  id: string;
  path: string;
  name: string;
  extension: string;
  language: string;
  size: number;
  linesOfCode: number;
  complexity: number;
  lastModified: Date;
  primaryAuthor?: string;
  repositoryId: string;
}

export interface Dependency {
  id: string;
  fromFileId: string;
  toFileId: string;
  type: 'import' | 'export' | 'call' | 'inherit';
  lineNumber?: number;
}

export interface FunctionNode {
  id: string;
  name: string;
  fileId: string;
  startLine: number;
  endLine: number;
  parameters: string[];
  returnType?: string;
  complexity: number;
  description?: string;
}

export interface Annotation {
  id: string;
  fileId: string;
  lineNumber: number;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'developer' | 'manager' | 'admin';
  createdAt: Date;
}

export interface LearningPath {
  id: string;
  userId: string;
  repositoryId: string;
  role: 'backend' | 'frontend' | 'fullstack' | 'devops';
  items: LearningPathItem[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPathItem {
  id: string;
  fileId: string;
  order: number;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: Date;
}

export interface ChatMessage {
  id: string;
  repositoryId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  sources?: CodeReference[];
  createdAt: Date;
}

export interface CodeReference {
  fileId: string;
  filePath: string;
  startLine: number;
  endLine: number;
  snippet: string;
}

export interface AnalysisResult {
  repositoryId: string;
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  frameworks: string[];
  entryPoints: string[];
  complexity: {
    average: number;
    highest: { file: string; score: number }[];
  };
  duration: number;
  completedAt: Date;
}

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java';
