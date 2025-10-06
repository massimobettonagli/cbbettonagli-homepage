/*
  Warnings:

  - You are about to drop the column `testo` on the `Richiesta` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ArticoloRichiesta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testo" TEXT NOT NULL,
    "richiestaId" TEXT NOT NULL,
    CONSTRAINT "ArticoloRichiesta_richiestaId_fkey" FOREIGN KEY ("richiestaId") REFERENCES "Richiesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Allegato" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "articoloId" TEXT NOT NULL,
    CONSTRAINT "Allegato_articoloId_fkey" FOREIGN KEY ("articoloId") REFERENCES "ArticoloRichiesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
INSERT INTO "new_Richiesta" ("anno", "createdAt", "id", "indirizzoId", "numero", "stato", "utenteId") SELECT "anno", "createdAt", "id", "indirizzoId", "numero", "stato", "utenteId" FROM "Richiesta";
DROP TABLE "Richiesta";
ALTER TABLE "new_Richiesta" RENAME TO "Richiesta";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
