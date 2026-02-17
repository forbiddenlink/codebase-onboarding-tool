/*
  Warnings:

  - You are about to drop columns on the `AnalysisResult` table.
  - These columns are being removed: complexity, duration, entryPoints, frameworks, languages, totalFiles, totalLines

*/

-- AlterTable
ALTER TABLE "AnalysisResult" 
  DROP COLUMN "complexity",
  DROP COLUMN "duration",
  DROP COLUMN "entryPoints",
  DROP COLUMN "frameworks",
  DROP COLUMN "languages",
  DROP COLUMN "totalFiles",
  DROP COLUMN "totalLines",  
  ADD COLUMN "fileCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "data" TEXT NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Repository" ALTER COLUMN "userId" DROP NOT NULL;
