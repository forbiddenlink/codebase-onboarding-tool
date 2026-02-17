import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import Python from 'tree-sitter-python';
import Go from 'tree-sitter-go';
import Rust from 'tree-sitter-rust';
import Java from 'tree-sitter-java';
import {
  ParseResult,
  Import,
  Export,
  FunctionDefinition,
  ClassDefinition,
  Parameter,
  Property,
} from './types';

export class CodeParser {
  private parser: Parser;
  private languageParsers: Map<string, unknown>;

  constructor() {
    this.parser = new Parser();
    this.languageParsers = new Map([
      ['typescript', TypeScript.typescript],
      ['tsx', TypeScript.tsx],
      ['javascript', TypeScript.typescript], // Use TS parser for JS
      ['jsx', TypeScript.tsx],
      ['python', Python],
      ['go', Go],
      ['rust', Rust],
      ['java', Java],
    ]);
  }

  async parseFile(filePath: string, content: string): Promise<ParseResult> {
    const language = this.detectLanguage(filePath);
    const languageParser = this.languageParsers.get(language);

    if (!languageParser) {
      return {
        filePath,
        language,
        imports: [],
        exports: [],
        functions: [],
        classes: [],
      };
    }

    this.parser.setLanguage(languageParser);
    const tree = this.parser.parse(content);

    // Parse based on language
    if (language === 'typescript' || language === 'tsx' || language === 'javascript' || language === 'jsx') {
      return this.parseTypeScriptFile(filePath, language, tree, content);
    } else if (language === 'python') {
      return this.parsePythonFile(filePath, tree, content);
    }

    return {
      filePath,
      language,
      imports: [],
      exports: [],
      functions: [],
      classes: [],
    };
  }

  private parseTypeScriptFile(
    filePath: string,
    language: string,
    tree: Parser.Tree,
    content: string
  ): ParseResult {
    const imports: Import[] = [];
    const exports: Export[] = [];
    const functions: FunctionDefinition[] = [];
    const classes: ClassDefinition[] = [];

    const lines = content.split('\n');

    // Traverse the syntax tree
    this.traverseNode(tree.rootNode, (node) => {
      // Parse imports
      if (node.type === 'import_statement') {
        const importData = this.parseImport(node, lines);
        if (importData) imports.push(importData);
      }

      // Parse exports
      if (node.type === 'export_statement' || node.parent?.type === 'export_statement') {
        const exportData = this.parseExport(node, lines);
        if (exportData) exports.push(exportData);
      }

      // Parse function declarations
      if (
        node.type === 'function_declaration' ||
        node.type === 'arrow_function' ||
        node.type === 'function_expression' ||
        node.type === 'method_definition'
      ) {
        const functionData = this.parseFunction(node, lines);
        if (functionData) functions.push(functionData);
      }

      // Parse class declarations
      if (node.type === 'class_declaration') {
        const classData = this.parseClass(node, lines);
        if (classData) classes.push(classData);
      }
    });

    return {
      filePath,
      language,
      imports,
      exports,
      functions,
      classes,
    };
  }

  private parsePythonFile(
    filePath: string,
    tree: Parser.Tree,
    content: string
  ): ParseResult {
    const imports: Import[] = [];
    const exports: Export[] = [];
    const functions: FunctionDefinition[] = [];
    const classes: ClassDefinition[] = [];

    const lines = content.split('\n');

    this.traverseNode(tree.rootNode, (node) => {
      // Parse imports
      if (node.type === 'import_statement' || node.type === 'import_from_statement') {
        const importData = this.parsePythonImport(node, lines);
        if (importData) imports.push(importData);
      }

      // Parse function definitions
      if (node.type === 'function_definition') {
        const functionData = this.parsePythonFunction(node, lines);
        if (functionData) functions.push(functionData);
      }

      // Parse class definitions
      if (node.type === 'class_definition') {
        const classData = this.parsePythonClass(node, lines);
        if (classData) classes.push(classData);
      }
    });

    return {
      filePath,
      language: 'python',
      imports,
      exports,
      functions,
      classes,
    };
  }

  private traverseNode(node: Parser.SyntaxNode, callback: (node: Parser.SyntaxNode) => void) {
    callback(node);
    for (let i = 0; i < node.childCount; i++) {
      this.traverseNode(node.child(i)!, callback);
    }
  }

  private parseImport(node: Parser.SyntaxNode, lines: string[]): Import | null {
    const lineNumber = node.startPosition.row + 1;
    const lineText = lines[node.startPosition.row] || '';

    // Extract source from import statement
    const sourceMatch = lineText.match(/from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/);
    const source = sourceMatch ? (sourceMatch[1] || sourceMatch[2]) : '';

    // Extract specifiers
    const specifiers: string[] = [];
    const specifierMatch = lineText.match(/import\s+{([^}]+)}|import\s+(\w+)/);
    if (specifierMatch) {
      if (specifierMatch[1]) {
        // Named imports
        specifiers.push(
          ...specifierMatch[1]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        );
      } else if (specifierMatch[2]) {
        // Default import
        specifiers.push(specifierMatch[2]);
      }
    }

    if (source) {
      return { source, specifiers, lineNumber };
    }

    return null;
  }

  private parsePythonImport(node: Parser.SyntaxNode, lines: string[]): Import | null {
    const lineNumber = node.startPosition.row + 1;
    const lineText = lines[node.startPosition.row] || '';

    // Python imports: "import x" or "from x import y"
    const fromMatch = lineText.match(/from\s+([\w.]+)\s+import\s+(.*)/);
    const importMatch = lineText.match(/import\s+([\w.]+)/);

    if (fromMatch) {
      const source = fromMatch[1];
      const specifiers = fromMatch[2]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return { source, specifiers, lineNumber };
    } else if (importMatch) {
      const source = importMatch[1];
      return { source, specifiers: [source], lineNumber };
    }

    return null;
  }

  private parseExport(node: Parser.SyntaxNode, lines: string[]): Export | null {
    const lineNumber = node.startPosition.row + 1;
    const lineText = lines[node.startPosition.row] || '';

    // Determine export type and name
    if (lineText.includes('export default')) {
      const nameMatch = lineText.match(/export\s+default\s+(class|function)?\s*(\w+)?/);
      return {
        name: nameMatch?.[2] || 'default',
        type: 'default',
        lineNumber,
      };
    }

    if (lineText.includes('export function')) {
      const nameMatch = lineText.match(/export\s+function\s+(\w+)/);
      if (nameMatch) {
        return { name: nameMatch[1], type: 'function', lineNumber };
      }
    }

    if (lineText.includes('export class')) {
      const nameMatch = lineText.match(/export\s+class\s+(\w+)/);
      if (nameMatch) {
        return { name: nameMatch[1], type: 'class', lineNumber };
      }
    }

    if (lineText.includes('export const') || lineText.includes('export let') || lineText.includes('export var')) {
      const nameMatch = lineText.match(/export\s+(?:const|let|var)\s+(\w+)/);
      if (nameMatch) {
        return { name: nameMatch[1], type: 'variable', lineNumber };
      }
    }

    return null;
  }

  private parseFunction(node: Parser.SyntaxNode, _lines: string[]): FunctionDefinition | null {
    const startLine = node.startPosition.row + 1;
    const endLine = node.endPosition.row + 1;

    // Find function name
    let name = 'anonymous';

    // For method definitions, get property_identifier first
    if (node.type === 'method_definition') {
      const propNode = this.findChildByType(node, 'property_identifier');
      if (propNode) {
        name = propNode.text;
      }
    } else {
      const nameNode = this.findChildByType(node, 'identifier');
      if (nameNode) {
        name = nameNode.text;
      } else {
        // For arrow functions, check parent for variable name
        if (node.parent?.type === 'variable_declarator') {
          const varName = this.findChildByType(node.parent, 'identifier');
          if (varName) name = varName.text;
        }
      }
    }

    // Parse parameters
    const parameters: Parameter[] = [];
    const paramsNode = this.findChildByType(node, 'formal_parameters');
    if (paramsNode) {
      this.traverseNode(paramsNode, (child) => {
        if (child.type === 'required_parameter' || child.type === 'optional_parameter') {
          const paramName = child.text.split(':')[0].trim();
          const typeMatch = child.text.match(/:\s*(.+?)(?:\s*=|$)/);
          const typeAnnotation = typeMatch ? typeMatch[1].trim() : undefined;
          const optional = child.type === 'optional_parameter';
          parameters.push({
            name: paramName,
            type: typeAnnotation,
            optional,
          });
        }
      });
    }

    // Parse return type - look for type_annotation
    let returnType: string | undefined;
    this.traverseNode(node, (child) => {
      if (child.type === 'type_annotation' && child.parent === node) {
        returnType = child.text.replace(/^:\s*/, '');
      }
    });

    return {
      name,
      startLine,
      endLine,
      parameters,
      returnType,
    };
  }

  private findChildByType(node: Parser.SyntaxNode, type: string): Parser.SyntaxNode | null {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child && child.type === type) {
        return child;
      }
    }
    return null;
  }

  private parsePythonFunction(node: Parser.SyntaxNode, _lines: string[]): FunctionDefinition | null {
    const startLine = node.startPosition.row + 1;
    const endLine = node.endPosition.row + 1;

    const nameNode = this.findChildByType(node, 'identifier');
    const name = nameNode?.text || 'anonymous';

    const parameters: Parameter[] = [];
    const paramsNode = this.findChildByType(node, 'parameters');
    if (paramsNode) {
      this.traverseNode(paramsNode, (child) => {
        if (child.type === 'identifier' && child.parent?.type === 'parameters') {
          parameters.push({
            name: child.text,
            optional: false,
          });
        }
      });
    }

    return {
      name,
      startLine,
      endLine,
      parameters,
    };
  }

  private parseClass(node: Parser.SyntaxNode, _lines: string[]): ClassDefinition | null {
    const startLine = node.startPosition.row + 1;
    const endLine = node.endPosition.row + 1;

    const nameNode = this.findChildByType(node, 'identifier') || this.findChildByType(node, 'type_identifier');
    const name = nameNode?.text || 'Anonymous';

    const methods: FunctionDefinition[] = [];
    const properties: Property[] = [];

    // Find class body
    const bodyNode = this.findChildByType(node, 'class_body');
    if (bodyNode) {
      this.traverseNode(bodyNode, (child) => {
        if (child.type === 'method_definition') {
          const method = this.parseFunction(child, _lines);
          if (method) methods.push(method);
        } else if (child.type === 'field_definition' || child.type === 'public_field_definition') {
          const propName = this.findChildByType(child, 'property_identifier')?.text || '';
          if (propName) {
            properties.push({
              name: propName,
              lineNumber: child.startPosition.row + 1,
            });
          }
        }
      });
    }

    // Parse extends
    const heritageNode = this.findChildByType(node, 'class_heritage');
    let extendsClass: string | undefined;
    if (heritageNode) {
      extendsClass = heritageNode.text.replace(/extends\s+/, '');
    }

    return {
      name,
      startLine,
      endLine,
      methods,
      properties,
      extends: extendsClass,
    };
  }

  private parsePythonClass(node: Parser.SyntaxNode, _lines: string[]): ClassDefinition | null {
    const startLine = node.startPosition.row + 1;
    const endLine = node.endPosition.row + 1;

    const nameNode = this.findChildByType(node, 'identifier');
    const name = nameNode?.text || 'Anonymous';

    const methods: FunctionDefinition[] = [];
    const properties: Property[] = [];

    const bodyNode = this.findChildByType(node, 'block');
    if (bodyNode) {
      this.traverseNode(bodyNode, (child) => {
        if (child.type === 'function_definition') {
          const method = this.parsePythonFunction(child, _lines);
          if (method) methods.push(method);
        }
      });
    }

    return {
      name,
      startLine,
      endLine,
      methods,
      properties,
    };
  }

  detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'tsx',
      js: 'javascript',
      jsx: 'jsx',
      py: 'python',
      go: 'go',
      rs: 'rust',
      java: 'java',
    };
    return languageMap[ext || ''] || 'unknown';
  }
}
