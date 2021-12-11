/*
  Warnings:

  - You are about to drop the column `status` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'DRAFT');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "status",
ADD COLUMN     "visibility" "PostVisibility" NOT NULL DEFAULT E'DRAFT';

-- DropEnum
DROP TYPE "PostStatus";
