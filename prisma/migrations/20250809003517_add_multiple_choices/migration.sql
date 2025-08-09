-- AlterTable
ALTER TABLE "public"."exercise" ADD COLUMN     "multiple_choice_options" TEXT[] DEFAULT ARRAY[]::TEXT[];
