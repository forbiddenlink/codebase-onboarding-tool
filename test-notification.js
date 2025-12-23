const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.log('Creating test user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('testpassword123', 10);

      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test User',
          role: 'developer',
        },
      });
      console.log('Test user created:', user.id);
    } else {
      console.log('Test user already exists:', user.id);
    }

    // Create test notifications
    console.log('Creating test notifications...');

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'learned_area_changed',
        title: 'Learned Module Updated',
        message: 'The authentication module you learned last week has been significantly modified. Several new security features were added.',
        metadata: JSON.stringify({
          fileId: 'test-file-1',
          filePath: 'packages/web/app/api/auth/login/route.ts',
          fileName: 'login/route.ts',
          repositoryId: 'test-repo',
          detectedAt: new Date().toISOString(),
        }),
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'breaking_change',
        title: 'Breaking Change Detected',
        message: 'A breaking change was detected in the User model. The email field is now required and must be unique.',
        metadata: JSON.stringify({
          fileId: 'test-file-2',
          filePath: 'packages/web/prisma/schema.prisma',
          fileName: 'schema.prisma',
          repositoryId: 'test-repo',
          detectedAt: new Date().toISOString(),
        }),
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'module_updated',
        title: 'Module Enhancement',
        message: 'New features were added to the Dashboard component! Check out the new statistics cards and charts.',
        metadata: JSON.stringify({
          fileId: 'test-file-3',
          filePath: 'packages/web/app/dashboard/page.tsx',
          fileName: 'page.tsx',
          repositoryId: 'test-repo',
          detectedAt: new Date().toISOString(),
        }),
      },
    });

    console.log('✅ Test notifications created successfully!');
    console.log('User ID:', user.id);
    console.log('Now update the notifications page to use this user ID:', user.id);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
