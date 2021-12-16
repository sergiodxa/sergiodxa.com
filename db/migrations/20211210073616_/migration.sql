-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "canonicalUrl" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "lang" TEXT NOT NULL DEFAULT E'en';
