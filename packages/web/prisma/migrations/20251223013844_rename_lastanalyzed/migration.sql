/*
  Warnings:

  - You are about to drop the column `lastAnalyzed` on the `Repository` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastAnalyzedAt" DATETIME,
    CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Repository" ("createdAt", "id", "name", "path", "updatedAt", "url", "userId") SELECT "createdAt", "id", "name", "path", "updatedAt", "url", "userId" FROM "Repository";
DROP TABLE "Repository";
ALTER TABLE "new_Repository" RENAME TO "Repository";
CREATE UNIQUE INDEX "Repository_path_key" ON "Repository"("path");
CREATE UNIQUE INDEX "Repository_url_key" ON "Repository"("url");
CREATE INDEX "Repository_userId_idx" ON "Repository"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
