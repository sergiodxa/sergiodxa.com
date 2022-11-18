-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
