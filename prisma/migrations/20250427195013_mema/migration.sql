-- CreateEnum
CREATE TYPE "StatutLocation" AS ENUM ('RESERVATION', 'CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('PAIEMENT', 'RESERVATION', 'COURSE', 'SYSTEME', 'OFFRE', 'CARTE', 'MAINTENANCE', 'AUTRE');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "resetCode" TEXT,
ADD COLUMN     "resetCodeExpires" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "validationCode" TEXT,
ADD COLUMN     "verified" BOOLEAN DEFAULT false,
ALTER COLUMN "ville" DROP NOT NULL,
ALTER COLUMN "dateInscription" DROP NOT NULL,
ALTER COLUMN "nbCourses" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LocationVehicule" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "lieuDepart" TEXT,
    "lieuDestination" TEXT,
    "departLatitude" DOUBLE PRECISION,
    "departLongitude" DOUBLE PRECISION,
    "destinationLatitude" DOUBLE PRECISION,
    "destinationLongitude" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "status" "StatutLocation" NOT NULL DEFAULT 'RESERVATION',
    "stripeCustomerId" TEXT,
    "stripePaymentId" TEXT,
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationVehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "chauffeurId" INTEGER,
    "clientId" INTEGER,
    "donnees" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocationVehicule_stripeSessionId_key" ON "LocationVehicule"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "LocationVehicule" ADD CONSTRAINT "LocationVehicule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationVehicule" ADD CONSTRAINT "LocationVehicule_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
