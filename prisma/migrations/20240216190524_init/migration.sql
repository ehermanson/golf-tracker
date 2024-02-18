-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "displayName" TEXT
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Handicap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "index" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Handicap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "par" INTEGER NOT NULL DEFAULT 72
);

-- CreateTable
CREATE TABLE "Hole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "strokeIndex" INTEGER NOT NULL,
    "courseId" TEXT,
    CONSTRAINT "Hole_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rating" DECIMAL,
    "slope" INTEGER,
    "yardage" INTEGER,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Tee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeeForHole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teeId" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "yardage" INTEGER NOT NULL,
    CONSTRAINT "TeeForHole_teeId_fkey" FOREIGN KEY ("teeId") REFERENCES "Tee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeeForHole_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "datePlayed" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "numberOfHoles" INTEGER NOT NULL DEFAULT 18,
    "totalScore" INTEGER,
    "totalGir" INTEGER,
    "totalFairways" INTEGER,
    "totalPutts" INTEGER,
    "notes" TEXT,
    "handicapAtTime" DECIMAL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teeId" TEXT NOT NULL,
    CONSTRAINT "Round_teeId_fkey" FOREIGN KEY ("teeId") REFERENCES "Tee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Round_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Round_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HoleStats" (
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
    CONSTRAINT "HoleStats_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_address_key" ON "Course"("name", "address");

-- CreateIndex
CREATE UNIQUE INDEX "Hole_number_courseId_key" ON "Hole"("number", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Tee_courseId_name_key" ON "Tee"("courseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "HoleStats_roundId_holeNumber_key" ON "HoleStats"("roundId", "holeNumber");
