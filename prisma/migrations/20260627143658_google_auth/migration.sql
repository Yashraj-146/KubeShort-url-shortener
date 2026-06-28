/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Click" ADD COLUMN     "referer" TEXT;

-- AlterTable
ALTER TABLE "public"."ShortLink" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "passwordHash",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE INDEX "Click_clickedAt_idx" ON "public"."Click"("clickedAt");

-- CreateIndex
CREATE INDEX "ShortLink_shortCode_idx" ON "public"."ShortLink"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId");
