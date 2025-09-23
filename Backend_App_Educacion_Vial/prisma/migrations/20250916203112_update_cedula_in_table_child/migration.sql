/*
  Warnings:

  - You are about to drop the column `email` on the `children` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `children` table. All the data in the column will be lost.
  - Added the required column `cedula` to the `children` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."children_email_key";

-- AlterTable
ALTER TABLE "public"."children" DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "cedula" TEXT NOT NULL;
