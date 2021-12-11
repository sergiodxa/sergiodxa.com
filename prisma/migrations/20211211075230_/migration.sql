-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PUBLISHED', 'DRAFT');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT E'DRAFT';
