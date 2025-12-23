const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up database...');

// Change to the web package directory
process.chdir(path.join(__dirname));

try {
  // Use db push to create tables without migrations
  console.log('Running prisma db push...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}
