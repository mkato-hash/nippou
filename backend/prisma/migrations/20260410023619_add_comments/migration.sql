-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trainingContent" TEXT NOT NULL,
    "progressStatus" TEXT NOT NULL,
    "problems" TEXT NOT NULL,
    "tomorrowPlan" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT NOT NULL DEFAULT '[]',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reports" ("id", "isRead", "problems", "progressStatus", "submittedAt", "tomorrowPlan", "trainingContent", "updatedAt", "userId") SELECT "id", "isRead", "problems", "progressStatus", "submittedAt", "tomorrowPlan", "trainingContent", "updatedAt", "userId" FROM "reports";
DROP TABLE "reports";
ALTER TABLE "new_reports" RENAME TO "reports";
CREATE INDEX "reports_userId_idx" ON "reports"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
