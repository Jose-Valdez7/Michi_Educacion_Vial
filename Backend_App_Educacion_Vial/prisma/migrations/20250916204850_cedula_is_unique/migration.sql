/*
  Warnings:

  - A unique constraint covering the columns `[cedula]` on the table `children` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "children_cedula_key" ON "public"."children"("cedula");
