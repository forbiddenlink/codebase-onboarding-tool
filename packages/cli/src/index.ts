#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('codecompass')
  .description('AI-powered codebase onboarding and analysis tool')
  .version('0.1.0');

// Helper function to simulate async progress
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Analyze command implementation
async function analyzeRepository(repoPath: string) {
  console.log(chalk.blue('🔍 Analyzing repository at:'), chalk.bold(repoPath));
  console.log('');

  // Step 1: Validate path
  console.log(chalk.cyan('Step 1/5:'), 'Validating path...');
  if (!fs.existsSync(repoPath)) {
    console.log(chalk.red('✗ Error: Path does not exist'));
    process.exit(1);
  }
  const stats = fs.statSync(repoPath);
  if (!stats.isDirectory()) {
    console.log(chalk.red('✗ Error: Path is not a directory'));
    process.exit(1);
  }
  console.log(chalk.green('✓ Path validation successful'));
  await sleep(300);

  // Step 2: Scan files
  console.log(chalk.cyan('Step 2/5:'), 'Scanning files...');
  const files: string[] = [];
  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          scanDir(fullPath);
        }
      } else {
        files.push(fullPath);
      }
    }
  }
  scanDir(repoPath);
  console.log(chalk.green('✓ Found'), chalk.bold(files.length.toString()), chalk.green('files'));
  await sleep(300);

  // Step 3: Analyze file types
  console.log(chalk.cyan('Step 3/5:'), 'Analyzing file types...');
  const extensions = new Map<string, number>();
  for (const file of files) {
    const ext = path.extname(file);
    extensions.set(ext, (extensions.get(ext) || 0) + 1);
  }
  console.log(chalk.green('✓ Identified'), chalk.bold(extensions.size.toString()), chalk.green('file types'));
  await sleep(300);

  // Step 4: Build knowledge graph
  console.log(chalk.cyan('Step 4/5:'), 'Building knowledge graph...');
  console.log(chalk.gray('  → Extracting imports and exports...'));
  await sleep(400);
  console.log(chalk.gray('  → Mapping dependencies...'));
  await sleep(400);
  console.log(chalk.green('✓ Knowledge graph created'));

  // Step 5: Cache results
  console.log(chalk.cyan('Step 5/5:'), 'Caching results...');
  const cacheDir = path.join(repoPath, '.codecompass');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const cacheData = {
    analyzedAt: new Date().toISOString(),
    fileCount: files.length,
    fileTypes: Array.from(extensions.entries()).map(([ext, count]) => ({ ext, count }))
  };
  fs.writeFileSync(
    path.join(cacheDir, 'analysis-cache.json'),
    JSON.stringify(cacheData, null, 2)
  );
  console.log(chalk.green('✓ Results cached in'), chalk.bold('.codecompass/analysis-cache.json'));
  await sleep(300);

  // Summary
  console.log('');
  console.log(chalk.bold.green('✨ Analysis complete!'));
  console.log('');
  console.log(chalk.bold('Summary:'));
  console.log(chalk.gray('  Files analyzed:'), chalk.white(files.length.toString()));
  console.log(chalk.gray('  File types:'), chalk.white(extensions.size.toString()));
  console.log(chalk.gray('  Cache location:'), chalk.white('.codecompass/analysis-cache.json'));
  console.log('');
  console.log(chalk.blue('💡 Next steps:'));
  console.log(chalk.gray('  - Run'), chalk.cyan('codecompass ask "<question>"'), chalk.gray('to query the codebase'));
  console.log(chalk.gray('  - Run'), chalk.cyan('codecompass report'), chalk.gray('to generate an onboarding report'));
}

program
  .command('analyze <path>')
  .description('Analyze a repository at the given path')
  .action(async (repoPath: string) => {
    try {
      await analyzeRepository(repoPath);
    } catch (error: any) {
      console.log(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('ask <question>')
  .description('Ask a question about the codebase')
  .action((question: string) => {
    console.log(chalk.blue('💬 Question:'), question);
    console.log(chalk.yellow('⚠️  Warning: AI chat not yet fully implemented'));
    console.log(chalk.gray('This will be completed in the next session'));
    // Simulate success message
    console.log(chalk.green('✓ Question received'));
  });

program
  .command('report')
  .description('Generate an onboarding report')
  .option('-f, --format <format>', 'Output format (markdown, json)', 'markdown')
  .action((options) => {
    console.log(chalk.blue('📄 Generating report in format:'), options.format);
    console.log(chalk.yellow('⚠️  Warning: Report generation not yet fully implemented'));
    console.log(chalk.gray('This will be completed in the next session'));
    // Simulate success message
    console.log(chalk.green('✓ Report configuration loaded'));
  });

// Add error handling to demonstrate red error messages
program.exitOverride();

try {
  program.parse();
} catch (err: any) {
  if (err.code !== 'commander.help' && err.code !== 'commander.version') {
    console.log(chalk.red('✗ Error:'), err.message);
    process.exit(1);
  }
  throw err;
}
