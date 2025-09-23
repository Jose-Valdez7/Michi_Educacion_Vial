/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `children` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birthDate` to the `children` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `children` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."children" ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sex" "public"."sex"[],
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "children_username_key" ON "public"."children"("username");
