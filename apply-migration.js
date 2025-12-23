const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    // Execute raw SQL to create the Notification table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Notification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "metadata" TEXT,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    console.log('Created Notification table');

    await prisma.$executeRawUnsafe(`CREATE INDEX "Notification_userId_idx" ON "Notification"("userId")`);
    console.log('Created userId index');

    await prisma.$executeRawUnsafe(`CREATE INDEX "Notification_read_idx" ON "Notification"("read")`);
    console.log('Created read index');

    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
