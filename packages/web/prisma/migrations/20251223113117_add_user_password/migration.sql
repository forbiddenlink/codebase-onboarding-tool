/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - For existing rows, password will be set to empty string (must be updated).

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';

-- Remove default after adding column
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;
