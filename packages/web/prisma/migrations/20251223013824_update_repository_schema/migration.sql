/*
  Warnings:

  - You are about to drop the column `complexity` on the `AnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `AnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `entryPoints` on the `AnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `frameworks` on the `AnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `AnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `totalFiles` on the `AnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `totalLines` on the `AnalysisResult` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnalysisResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" TEXT NOT NULL,
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "data" TEXT NOT NULL DEFAULT '{}',
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisResult_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AnalysisResult" ("completedAt", "id", "repositoryId") SELECT "completedAt", "id", "repositoryId" FROM "AnalysisResult";
DROP TABLE "AnalysisResult";
ALTER TABLE "new_AnalysisResult" RENAME TO "AnalysisResult";
CREATE INDEX "AnalysisResult_repositoryId_idx" ON "AnalysisResult"("repositoryId");
CREATE TABLE "new_Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastAnalyzed" DATETIME,
    CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Repository" ("createdAt", "id", "lastAnalyzed", "name", "path", "updatedAt", "url", "userId") SELECT "createdAt", "id", "lastAnalyzed", "name", "path", "updatedAt", "url", "userId" FROM "Repository";
DROP TABLE "Repository";
ALTER TABLE "new_Repository" RENAME TO "Repository";
CREATE UNIQUE INDEX "Repository_path_key" ON "Repository"("path");
CREATE UNIQUE INDEX "Repository_url_key" ON "Repository"("url");
CREATE INDEX "Repository_userId_idx" ON "Repository"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
