-- AlterTable
ALTER TABLE "public"."lesson" ADD COLUMN     "generated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "summary" TEXT NOT NULL DEFAULT '';
