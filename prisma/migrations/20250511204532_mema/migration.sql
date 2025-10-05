-- CreateEnum
CREATE TYPE "CategoryVehicule" AS ENUM ('BASIC', 'CONFORT', 'FAMILIALE', 'VIP', 'BUS');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('ESSENCE', 'DIESEL', 'ELECTRIQUE', 'HYBRIDE', 'GPL');

-- CreateEnum
CREATE TYPE "GearType" AS ENUM ('MANUEL', 'AUTOMATIQUE', 'SEMI_AUTOMATIQUE');

-- CreateEnum
CREATE TYPE "StatutTransport" AS ENUM ('EN_ATTENTE', 'VALIDE', 'EN_ROUTE_RAMASSAGE', 'ARRIVE_RAMASSAGE', 'EN_COURSE', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeExpediteur" AS ENUM ('CLIENT', 'CHAUFFEUR');

-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "acceleration" DOUBLE PRECISION,
ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "categorie" "CategoryVehicule" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "color" TEXT,
ADD COLUMN     "fuelConsumption" DOUBLE PRECISION,
ADD COLUMN     "fuelType" "FuelType",
ADD COLUMN     "gearType" "GearType",
ADD COLUMN     "maxPower" DOUBLE PRECISION,
ADD COLUMN     "maxSpeed" INTEGER,
ADD COLUMN     "tarifHoraire" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "tarifJournalier" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "Transport" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "chauffeurId" INTEGER,
    "dateReservation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adresseDepart" TEXT NOT NULL,
    "adresseDestination" TEXT NOT NULL,
    "departLatitude" DOUBLE PRECISION NOT NULL,
    "departLongitude" DOUBLE PRECISION NOT NULL,
    "destinationLatitude" DOUBLE PRECISION NOT NULL,
    "destinationLongitude" DOUBLE PRECISION NOT NULL,
    "distanceEstimee" DOUBLE PRECISION NOT NULL,
    "dureeEstimee" INTEGER NOT NULL,
    "montantEstime" DOUBLE PRECISION NOT NULL,
    "montantFinal" DOUBLE PRECISION,
    "status" "StatutTransport" NOT NULL DEFAULT 'EN_ATTENTE',
    "stripePaymentIntentId" TEXT,
    "evaluation" INTEGER,
    "commentaire" TEXT,
    "positionActuelle" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "clientId" INTEGER,
    "chauffeurId" INTEGER,
    "reservationId" INTEGER,
    "courseId" INTEGER,
    "expediteurType" "TypeExpediteur" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NotificationToTransport" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_NotificationToTransport_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MessageToTransport" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MessageToTransport_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_NotificationToTransport_B_index" ON "_NotificationToTransport"("B");

-- CreateIndex
CREATE INDEX "_MessageToTransport_B_index" ON "_MessageToTransport"("B");

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "LocationVehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToTransport" ADD CONSTRAINT "_NotificationToTransport_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToTransport" ADD CONSTRAINT "_NotificationToTransport_B_fkey" FOREIGN KEY ("B") REFERENCES "Transport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToTransport" ADD CONSTRAINT "_MessageToTransport_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToTransport" ADD CONSTRAINT "_MessageToTransport_B_fkey" FOREIGN KEY ("B") REFERENCES "Transport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
