/*
  Warnings:

  - You are about to drop the column `imageSearch` on the `theorie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."theorie" DROP COLUMN "imageSearch",
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
