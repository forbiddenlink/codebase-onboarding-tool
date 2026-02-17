/*
  Warnings:

  - You are about to drop the column `lastAnalyzed` on the `Repository` table.
  - You are renaming it to `lastAnalyzedAt`.

*/
-- AlterTable
ALTER TABLE "Repository" 
  DROP COLUMN "lastAnalyzed",
  ADD COLUMN "lastAnalyzedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Repository_path_key" ON "Repository"("path");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Repository_url_key" ON "Repository"("url");
