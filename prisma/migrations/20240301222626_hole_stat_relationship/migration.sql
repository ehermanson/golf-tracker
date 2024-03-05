-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HoleStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "holeNumber" INTEGER NOT NULL,
    "score" INTEGER,
    "putts" INTEGER,
    "drive" TEXT,
    "approach" TEXT,
    "chipShots" INTEGER,
    "sandShots" INTEGER,
    "note" TEXT,
    "roundId" TEXT NOT NULL,
    "holeId" TEXT,
    CONSTRAINT "HoleStats_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HoleStats_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_HoleStats" ("approach", "chipShots", "drive", "holeNumber", "id", "note", "putts", "roundId", "sandShots", "score") SELECT "approach", "chipShots", "drive", "holeNumber", "id", "note", "putts", "roundId", "sandShots", "score" FROM "HoleStats";
DROP TABLE "HoleStats";
ALTER TABLE "new_HoleStats" RENAME TO "HoleStats";
CREATE UNIQUE INDEX "HoleStats_roundId_holeNumber_key" ON "HoleStats"("roundId", "holeNumber");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
