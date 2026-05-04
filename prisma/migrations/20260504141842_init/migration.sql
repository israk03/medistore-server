/*
  Warnings:

  - A unique constraint covering the columns `[name,sellerId]` on the table `medicines` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "medicines_name_sellerId_key" ON "medicines"("name", "sellerId");
