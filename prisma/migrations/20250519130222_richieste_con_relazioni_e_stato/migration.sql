/*
  Warnings:

  - Added the required column `indirizzoId` to the `Richiesta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utenteId` to the `Richiesta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Messaggio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contenuto" TEXT NOT NULL,
    "daAdmin" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "richiestaId" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    CONSTRAINT "Messaggio_richiestaId_fkey" FOREIGN KEY ("richiestaId") REFERENCES "Richiesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Messaggio_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Richiesta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "anno" INTEGER NOT NULL,
    "stato" TEXT NOT NULL DEFAULT 'INVIATA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utenteId" TEXT NOT NULL,
    "indirizzoId" TEXT NOT NULL,
    CONSTRAINT "Richiesta_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Richiesta_indirizzoId_fkey" FOREIGN KEY ("indirizzoId") REFERENCES "ShippingAddress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Richiesta" ("anno", "createdAt", "id", "numero") SELECT "anno", "createdAt", "id", "numero" FROM "Richiesta";
DROP TABLE "Richiesta";
ALTER TABLE "new_Richiesta" RENAME TO "Richiesta";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
