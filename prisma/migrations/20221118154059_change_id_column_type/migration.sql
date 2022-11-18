/*
  Warnings:

  - The primary key for the `Bookmark` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Bookmark` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bookmark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL
);
INSERT INTO "new_Bookmark" ("createdAt", "id", "title", "url") SELECT "createdAt", "id", "title", "url" FROM "Bookmark";
DROP TABLE "Bookmark";
ALTER TABLE "new_Bookmark" RENAME TO "Bookmark";
CREATE UNIQUE INDEX "Bookmark_url_key" ON "Bookmark"("url");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
