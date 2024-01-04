-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL
);
INSERT INTO "new_todo" ("completed", "createdAt", "description", "id", "title", "updatedAt", "userId") SELECT "completed", "createdAt", "description", "id", "title", "updatedAt", "userId" FROM "todo";
DROP TABLE "todo";
ALTER TABLE "new_todo" RENAME TO "todo";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
