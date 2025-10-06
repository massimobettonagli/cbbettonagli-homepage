/*
  Warnings:

  - Added the required column `updatedAt` to the `Messaggio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Offerta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Richiesta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ShippingAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Messaggio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contenuto" TEXT NOT NULL,
    "daAdmin" BOOLEAN NOT NULL,
    "letto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "richiestaId" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    CONSTRAINT "Messaggio_richiestaId_fkey" FOREIGN KEY ("richiestaId") REFERENCES "Richiesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Messaggio_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Messaggio" ("contenuto", "createdAt", "daAdmin", "id", "letto", "richiestaId", "utenteId") SELECT "contenuto", "createdAt", "daAdmin", "id", "letto", "richiestaId", "utenteId" FROM "Messaggio";
DROP TABLE "Messaggio";
ALTER TABLE "new_Messaggio" RENAME TO "Messaggio";
CREATE TABLE "new_Offerta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "vista" BOOLEAN NOT NULL DEFAULT false,
    "richiestaId" TEXT NOT NULL,
    CONSTRAINT "Offerta_richiestaId_fkey" FOREIGN KEY ("richiestaId") REFERENCES "Richiesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Offerta" ("createdAt", "fileUrl", "id", "richiestaId", "vista") SELECT "createdAt", "fileUrl", "id", "richiestaId", "vista" FROM "Offerta";
DROP TABLE "Offerta";
ALTER TABLE "new_Offerta" RENAME TO "Offerta";
CREATE UNIQUE INDEX "Offerta_richiestaId_key" ON "Offerta"("richiestaId");
CREATE TABLE "new_Richiesta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "anno" INTEGER NOT NULL,
    "stato" TEXT NOT NULL DEFAULT 'INVIATA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "utenteId" TEXT NOT NULL,
    "indirizzoId" TEXT NOT NULL,
    CONSTRAINT "Richiesta_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Richiesta_indirizzoId_fkey" FOREIGN KEY ("indirizzoId") REFERENCES "ShippingAddress" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Richiesta" ("anno", "createdAt", "id", "indirizzoId", "numero", "stato", "utenteId") SELECT "anno", "createdAt", "id", "indirizzoId", "numero", "stato", "utenteId" FROM "Richiesta";
DROP TABLE "Richiesta";
ALTER TABLE "new_Richiesta" RENAME TO "Richiesta";
CREATE TABLE "new_ShippingAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "civicNumber" TEXT,
    "cap" TEXT,
    "city" TEXT,
    "companyName" TEXT,
    "codiceFiscale" TEXT,
    "partitaIva" TEXT,
    "email" TEXT,
    "pec" TEXT,
    "codiceSDI" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ShippingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ShippingAddress" ("address", "cap", "city", "civicNumber", "codiceFiscale", "codiceSDI", "companyName", "createdAt", "email", "id", "label", "partitaIva", "pec", "userId") SELECT "address", "cap", "city", "civicNumber", "codiceFiscale", "codiceSDI", "companyName", "createdAt", "email", "id", "label", "partitaIva", "pec", "userId" FROM "ShippingAddress";
DROP TABLE "ShippingAddress";
ALTER TABLE "new_ShippingAddress" RENAME TO "ShippingAddress";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyName" TEXT,
    "billingAddress" TEXT,
    "civicNumber" TEXT,
    "cap" TEXT,
    "city" TEXT,
    "codiceFiscale" TEXT,
    "partitaIva" TEXT,
    "billingEmail" TEXT,
    "pec" TEXT,
    "codiceSDI" TEXT
);
INSERT INTO "new_User" ("billingAddress", "billingEmail", "cap", "city", "civicNumber", "codiceFiscale", "codiceSDI", "companyName", "createdAt", "email", "id", "isAdmin", "name", "partitaIva", "password", "pec") SELECT "billingAddress", "billingEmail", "cap", "city", "civicNumber", "codiceFiscale", "codiceSDI", "companyName", "createdAt", "email", "id", "isAdmin", "name", "partitaIva", "password", "pec" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
