-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Offerta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vista" BOOLEAN NOT NULL DEFAULT false,
    "richiestaId" TEXT NOT NULL,
    CONSTRAINT "Offerta_richiestaId_fkey" FOREIGN KEY ("richiestaId") REFERENCES "Richiesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Offerta" ("createdAt", "fileUrl", "id", "richiestaId") SELECT "createdAt", "fileUrl", "id", "richiestaId" FROM "Offerta";
DROP TABLE "Offerta";
ALTER TABLE "new_Offerta" RENAME TO "Offerta";
CREATE UNIQUE INDEX "Offerta_richiestaId_key" ON "Offerta"("richiestaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
