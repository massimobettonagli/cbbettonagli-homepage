-- CreateTable
CREATE TABLE "ShippingAddress" (
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
    "userId" TEXT NOT NULL,
    CONSTRAINT "ShippingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
