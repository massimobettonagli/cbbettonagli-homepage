-- CreateTable
CREATE TABLE "Offerta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "richiestaId" TEXT NOT NULL,
    CONSTRAINT "Offerta_richiestaId_fkey" FOREIGN KEY ("richiestaId") REFERENCES "Richiesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "richiestaId" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    CONSTRAINT "Messaggio_richiestaId_fkey" FOREIGN KEY ("richiestaId") REFERENCES "Richiesta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Messaggio_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Messaggio" ("contenuto", "createdAt", "daAdmin", "id", "richiestaId", "utenteId") SELECT "contenuto", "createdAt", "daAdmin", "id", "richiestaId", "utenteId" FROM "Messaggio";
DROP TABLE "Messaggio";
ALTER TABLE "new_Messaggio" RENAME TO "Messaggio";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
INSERT INTO "new_User" ("billingAddress", "billingEmail", "cap", "city", "civicNumber", "codiceFiscale", "codiceSDI", "companyName", "createdAt", "email", "id", "name", "partitaIva", "password", "pec") SELECT "billingAddress", "billingEmail", "cap", "city", "civicNumber", "codiceFiscale", "codiceSDI", "companyName", "createdAt", "email", "id", "name", "partitaIva", "password", "pec" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Offerta_richiestaId_key" ON "Offerta"("richiestaId");
