-- AlterTable
ALTER TABLE "stories" ADD COLUMN     "comments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "commentsCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "author" SET DEFAULT '';
