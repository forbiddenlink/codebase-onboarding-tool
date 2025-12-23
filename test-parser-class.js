const parser = require('./packages/analyzer/dist/parser.js');
const fs = require('fs');
const path = require('path');

async function test() {
  const p = new parser.CodeParser();
  const file = path.join(__dirname, 'examples/sample-repos/sample-ts-project/src/services/userService.ts');
  const content = fs.readFileSync(file, 'utf-8');
  const result = await p.parseFile(file, content);

  console.log('='.repeat(80));
  console.log('PARSER TEST RESULTS - userService.ts');
  console.log('='.repeat(80));
  console.log('\nLanguage:', result.language);
  console.log('\nImports:', result.imports.length);
  result.imports.forEach(imp => {
    console.log(`  Line ${imp.lineNumber}: from "${imp.source}" import [${imp.specifiers.join(', ')}]`);
  });
  console.log('\nExports:', result.exports.length);
  result.exports.forEach(exp => {
    console.log(`  Line ${exp.lineNumber}: ${exp.type} "${exp.name}"`);
  });
  console.log('\nClasses:', result.classes.length);
  result.classes.forEach(cls => {
    console.log(`  Lines ${cls.startLine}-${cls.endLine}: class ${cls.name}`);
    console.log(`    Methods: ${cls.methods.length}`);
    cls.methods.forEach(method => {
      console.log(`      - ${method.name}() [lines ${method.startLine}-${method.endLine}]`);
    });
    console.log(`    Properties: ${cls.properties.length}`);
    cls.properties.forEach(prop => {
      console.log(`      - ${prop.name}`);
    });
  });

  console.log('\n' + '='.repeat(80));
}

test().catch(console.error);
