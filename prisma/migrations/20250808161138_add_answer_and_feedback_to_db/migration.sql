-- AlterTable
ALTER TABLE "public"."exercise" ADD COLUMN     "answer" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "failedFeedback" TEXT NOT NULL DEFAULT '';
