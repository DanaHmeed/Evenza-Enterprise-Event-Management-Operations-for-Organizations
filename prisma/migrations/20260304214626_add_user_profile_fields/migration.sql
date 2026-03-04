/*
  Warnings:

  - The primary key for the `_EventTags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_EventTags` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experience" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "organization" TEXT;

-- AlterTable
ALTER TABLE "_EventTags" DROP CONSTRAINT "_EventTags_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_EventTags_AB_unique" ON "_EventTags"("A", "B");
