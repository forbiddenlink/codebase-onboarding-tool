// Constants for CodeCompass

export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'go',
  'rust',
  'java',
] as const;

export const FILE_EXTENSIONS: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
};

export const DEFAULT_IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  'out',
  '*.test.ts',
  '*.test.js',
  '*.spec.ts',
  '*.spec.js',
];

export const MAX_FILE_SIZE = 1024 * 1024; // 1MB
export const MAX_CHAT_HISTORY = 50;
export const DEFAULT_COMPLEXITY_THRESHOLD = 10;

export const LEARNING_PATH_ROLES = [
  'backend',
  'frontend',
  'fullstack',
  'devops',
] as const;
