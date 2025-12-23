// Analyzer-specific types

export interface ParseResult {
  filePath: string;
  language: string;
  imports: Import[];
  exports: Export[];
  functions: FunctionDefinition[];
  classes: ClassDefinition[];
}

export interface Import {
  source: string;
  specifiers: string[];
  lineNumber: number;
}

export interface Export {
  name: string;
  type: 'function' | 'class' | 'variable' | 'default';
  lineNumber: number;
}

export interface FunctionDefinition {
  name: string;
  startLine: number;
  endLine: number;
  parameters: Parameter[];
  returnType?: string;
}

export interface Parameter {
  name: string;
  type?: string;
  optional: boolean;
}

export interface ClassDefinition {
  name: string;
  startLine: number;
  endLine: number;
  methods: FunctionDefinition[];
  properties: Property[];
  extends?: string;
  implements?: string[];
}

export interface Property {
  name: string;
  type?: string;
  lineNumber: number;
}
