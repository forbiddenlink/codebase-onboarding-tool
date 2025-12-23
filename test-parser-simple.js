const parser = require('./packages/analyzer/dist/parser.js');
const fs = require('fs');
const path = require('path');

async function test() {
  const p = new parser.CodeParser();
  const file = path.join(__dirname, 'examples/sample-repos/sample-ts-project/src/index.ts');
  const content = fs.readFileSync(file, 'utf-8');
  const result = await p.parseFile(file, content);

  console.log('='.repeat(80));
  console.log('PARSER TEST RESULTS - index.ts');
  console.log('='.repeat(80));
  console.log('\nLanguage:', result.language);
  console.log('\nImports:', result.imports.length);
  result.imports.forEach(imp => {
    console.log(`  Line ${imp.lineNumber}: from "${imp.source}"`);
  });
  console.log('\nExports:', result.exports.length);
  result.exports.forEach(exp => {
    console.log(`  Line ${exp.lineNumber}: ${exp.type} "${exp.name}"`);
  });
  console.log('\nFunctions:', result.functions.length);
  result.functions.forEach(func => {
    console.log(`  Lines ${func.startLine}-${func.endLine}: ${func.name}()`);
  });
  console.log('\nClasses:', result.classes.length);

  console.log('\n' + '='.repeat(80));
}

test().catch(console.error);
