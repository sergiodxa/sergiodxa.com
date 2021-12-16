-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC', 'DRAFT');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('ARTICLE', 'BOOKMARK', 'STACK');

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT E'PRIVATE',
    "type" "ContentType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "headline" TEXT,
    "canonicalUrl" TEXT,
    "lang" TEXT NOT NULL DEFAULT E'en',
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_id_key" ON "Content"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
