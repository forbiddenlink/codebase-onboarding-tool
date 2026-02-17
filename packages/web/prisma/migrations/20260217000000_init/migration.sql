-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'developer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAnalyzedAt" TIMESTAMP(3),

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileNode" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "linesOfCode" INTEGER NOT NULL,
    "complexity" DOUBLE PRECISION NOT NULL,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "primaryAuthor" TEXT,
    "metadata" TEXT,
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependency" (
    "id" TEXT NOT NULL,
    "fromFileId" TEXT NOT NULL,
    "toFileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionNode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "startLine" INTEGER NOT NULL,
    "endLine" INTEGER NOT NULL,
    "parameters" TEXT NOT NULL,
    "returnType" TEXT,
    "complexity" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FunctionNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "sources" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathItem" (
    "id" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "data" TEXT NOT NULL DEFAULT '{}',
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_path_key" ON "Repository"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_url_key" ON "Repository"("url");

-- CreateIndex
CREATE INDEX "Repository_userId_idx" ON "Repository"("userId");

-- CreateIndex
CREATE INDEX "FileNode_repositoryId_idx" ON "FileNode"("repositoryId");

-- CreateIndex
CREATE INDEX "FileNode_language_idx" ON "FileNode"("language");

-- CreateIndex
CREATE UNIQUE INDEX "FileNode_repositoryId_path_key" ON "FileNode"("repositoryId", "path");

-- CreateIndex
CREATE INDEX "Dependency_fromFileId_idx" ON "Dependency"("fromFileId");

-- CreateIndex
CREATE INDEX "Dependency_toFileId_idx" ON "Dependency"("toFileId");

-- CreateIndex
CREATE INDEX "FunctionNode_fileId_idx" ON "FunctionNode"("fileId");

-- CreateIndex
CREATE INDEX "FunctionNode_name_idx" ON "FunctionNode"("name");

-- CreateIndex
CREATE INDEX "Annotation_fileId_idx" ON "Annotation"("fileId");

-- CreateIndex
CREATE INDEX "Annotation_authorId_idx" ON "Annotation"("authorId");

-- CreateIndex
CREATE INDEX "ChatMessage_repositoryId_idx" ON "ChatMessage"("repositoryId");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");

-- CreateIndex
CREATE INDEX "LearningPath_userId_idx" ON "LearningPath"("userId");

-- CreateIndex
CREATE INDEX "LearningPath_repositoryId_idx" ON "LearningPath"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_userId_repositoryId_key" ON "LearningPath"("userId", "repositoryId");

-- CreateIndex
CREATE INDEX "LearningPathItem_learningPathId_idx" ON "LearningPathItem"("learningPathId");

-- CreateIndex
CREATE INDEX "LearningPathItem_fileId_idx" ON "LearningPathItem"("fileId");

-- CreateIndex
CREATE INDEX "AnalysisResult_repositoryId_idx" ON "AnalysisResult"("repositoryId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileNode" ADD CONSTRAINT "FileNode_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_fromFileId_fkey" FOREIGN KEY ("fromFileId") REFERENCES "FileNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_toFileId_fkey" FOREIGN KEY ("toFileId") REFERENCES "FileNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionNode" ADD CONSTRAINT "FunctionNode_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathItem" ADD CONSTRAINT "LearningPathItem_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisResult" ADD CONSTRAINT "AnalysisResult_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

