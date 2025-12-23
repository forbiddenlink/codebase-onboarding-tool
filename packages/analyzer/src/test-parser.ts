#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';
import { CodeParser } from './parser';

async function testParser() {
  const parser = new CodeParser();

  // Test with sample TypeScript project
  const sampleTsProject = path.join(__dirname, '../../../examples/sample-repos/sample-ts-project');

  console.log('='.repeat(80));
  console.log('TESTING TYPESCRIPT/JAVASCRIPT PARSER');
  console.log('='.repeat(80));
  console.log('');

  // Test files
  const testFiles = [
    path.join(sampleTsProject, 'src/index.ts'),
    path.join(sampleTsProject, 'src/services/userService.ts'),
    path.join(sampleTsProject, 'src/utils/logger.ts'),
  ];

  for (const filePath of testFiles) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`FILE: ${path.relative(sampleTsProject, filePath)}`);
    console.log('='.repeat(80));

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const result = await parser.parseFile(filePath, content);

      console.log(`\n📁 Language: ${result.language}`);

      console.log(`\n📥 Imports (${result.imports.length}):`);
      result.imports.forEach(imp => {
        console.log(`  Line ${imp.lineNumber}: from "${imp.source}" import [${imp.specifiers.join(', ')}]`);
      });

      console.log(`\n📤 Exports (${result.exports.length}):`);
      result.exports.forEach(exp => {
        console.log(`  Line ${exp.lineNumber}: export ${exp.type} "${exp.name}"`);
      });

      console.log(`\n🔧 Functions (${result.functions.length}):`);
      result.functions.forEach(func => {
        const params = func.parameters.map(p =>
          `${p.name}${p.optional ? '?' : ''}${p.type ? ': ' + p.type : ''}`
        ).join(', ');
        const returnType = func.returnType ? `: ${func.returnType}` : '';
        console.log(`  Lines ${func.startLine}-${func.endLine}: ${func.name}(${params})${returnType}`);
      });

      console.log(`\n🏛️  Classes (${result.classes.length}):`);
      result.classes.forEach(cls => {
        console.log(`  Lines ${cls.startLine}-${cls.endLine}: class ${cls.name}`);
        if (cls.extends) {
          console.log(`    extends: ${cls.extends}`);
        }
        if (cls.properties.length > 0) {
          console.log(`    properties (${cls.properties.length}):`);
          cls.properties.forEach(prop => {
            console.log(`      - ${prop.name}${prop.type ? ': ' + prop.type : ''}`);
          });
        }
        if (cls.methods.length > 0) {
          console.log(`    methods (${cls.methods.length}):`);
          cls.methods.forEach(method => {
            console.log(`      - ${method.name}()`);
          });
        }
      });

      console.log('\n✅ Parsing successful!');

    } catch (error) {
      console.error(`\n❌ Error parsing file: ${error}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
}

testParser().catch(console.error);
