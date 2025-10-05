/*
  Warnings:

  - You are about to drop the `_MessageToTransport` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[telephone]` on the table `Chauffeur` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telephone]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[locationId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transportId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TypeService" AS ENUM ('DIRECT', 'LOCATION', 'TRANSPORT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'CASH');

-- CreateEnum
CREATE TYPE "CashPaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DISPUTED');

-- AlterEnum
ALTER TYPE "StatutTransport" ADD VALUE 'EN_ATTENTE_PAIEMENT';

-- AlterEnum
ALTER TYPE "TypeExpediteur" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "_MessageToTransport" DROP CONSTRAINT "_MessageToTransport_A_fkey";

-- DropForeignKey
ALTER TABLE "_MessageToTransport" DROP CONSTRAINT "_MessageToTransport_B_fkey";

-- AlterTable
ALTER TABLE "Chauffeur" ADD COLUMN     "phoneVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "resetCode" TEXT,
ADD COLUMN     "resetCodeExpiry" TIMESTAMP(3),
ADD COLUMN     "smsOtp" TEXT,
ADD COLUMN     "smsOtpExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "phoneVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "smsOtp" TEXT,
ADD COLUMN     "smsOtpExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "locationId" INTEGER,
ADD COLUMN     "transportId" INTEGER,
ADD COLUMN     "typeService" "TypeService" NOT NULL DEFAULT 'DIRECT';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "transportId" INTEGER;

-- AlterTable
ALTER TABLE "Transport" ADD COLUMN     "cashAmountReceived" DOUBLE PRECISION,
ADD COLUMN     "cashConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "cashConfirmedBy" INTEGER,
ADD COLUMN     "cashPaymentStatus" "CashPaymentStatus",
ADD COLUMN     "distanceReelle" DOUBLE PRECISION,
ADD COLUMN     "dureeReelle" INTEGER,
ADD COLUMN     "heureArrivee" TIMESTAMP(3),
ADD COLUMN     "heureDepart" TIMESTAMP(3),
ADD COLUMN     "montantReduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'STRIPE',
ADD COLUMN     "promoCodeId" INTEGER,
ADD COLUMN     "tarifHoraireApplique" DOUBLE PRECISION;

-- DropTable
DROP TABLE "_MessageToTransport";

-- CreateTable
CREATE TABLE "AdminMessage" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "chauffeurId" INTEGER NOT NULL,
    "expediteurType" "TypeExpediteur" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteDestination" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavoriteDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "typeReduction" TEXT NOT NULL,
    "valeurReduction" DOUBLE PRECISION NOT NULL,
    "dateExpiration" TIMESTAMP(3),
    "utilisationsMax" INTEGER,
    "utilisations" INTEGER NOT NULL DEFAULT 0,
    "montantMinimum" DOUBLE PRECISION,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MessageTransports" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MessageTransports_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "_MessageTransports_B_index" ON "_MessageTransports"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_telephone_key" ON "Chauffeur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Client_telephone_key" ON "Client"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Course_locationId_key" ON "Course"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_transportId_key" ON "Course"("transportId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "LocationVehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "Transport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "Transport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMessage" ADD CONSTRAINT "AdminMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMessage" ADD CONSTRAINT "AdminMessage_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteDestination" ADD CONSTRAINT "FavoriteDestination_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageTransports" ADD CONSTRAINT "_MessageTransports_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageTransports" ADD CONSTRAINT "_MessageTransports_B_fkey" FOREIGN KEY ("B") REFERENCES "Transport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
