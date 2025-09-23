/*
  Warnings:

  - You are about to drop the `Login` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."roles" AS ENUM ('CHILD', 'ADMIN');

-- DropTable
DROP TABLE "public"."Login";

-- DropTable
DROP TABLE "public"."User";
