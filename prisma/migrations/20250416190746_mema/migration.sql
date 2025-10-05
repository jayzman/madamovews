-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTIONNAIRE', 'UTILISATEUR', 'SUPPORT');

-- CreateEnum
CREATE TYPE "StatutChauffeur" AS ENUM ('SALARIE', 'INDEPENDANT');

-- CreateEnum
CREATE TYPE "StatutActivite" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "TypeTarif" AS ENUM ('STANDARD', 'PREMIUM', 'VIP');

-- CreateEnum
CREATE TYPE "TypeVehicule" AS ENUM ('VAN', 'BUS', 'BERLINE', 'SUV', 'AUTOCAR', 'BASIC', 'CONFORT', 'FAMILIALE', 'VIP');

-- CreateEnum
CREATE TYPE "StatutVehicule" AS ENUM ('DISPONIBLE', 'ASSIGNE', 'EN_MAINTENANCE', 'EN_SERVICE');

-- CreateEnum
CREATE TYPE "StatutClient" AS ENUM ('ACTIF', 'INACTIF', 'BANNI');

-- CreateEnum
CREATE TYPE "StatutCourse" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeIncident" AS ENUM ('RETARD', 'LITIGE', 'PROBLEME_TECHNIQUE', 'ACCIDENT', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutIncident" AS ENUM ('NON_RESOLU', 'EN_COURS_DE_RESOLUTION', 'RESOLU');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('PERMIS_DE_CONDUIRE', 'ASSURANCE', 'CONTROLE_TECHNIQUE', 'CARTE_PROFESSIONNELLE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('VALIDE', 'EN_ATTENTE', 'REJETE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "StatutMaintenance" AS ENUM ('PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'UTILISATEUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chauffeur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "statut" "StatutChauffeur" NOT NULL,
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statutActivite" "StatutActivite" NOT NULL DEFAULT 'ACTIF',
    "nbCourses" INTEGER NOT NULL DEFAULT 0,
    "vehiculeId" INTEGER,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chauffeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" SERIAL NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "type" "TypeVehicule" NOT NULL,
    "statut" "StatutVehicule" NOT NULL DEFAULT 'DISPONIBLE',
    "dateAcquisition" TIMESTAMP(3) NOT NULL,
    "kilometrage" INTEGER NOT NULL DEFAULT 0,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dateControleTechnique" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarif" (
    "id" SERIAL NOT NULL,
    "vehiculeId" INTEGER NOT NULL,
    "type" "TypeTarif" NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT NOT NULL,
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutClient" NOT NULL DEFAULT 'ACTIF',
    "nbCourses" INTEGER NOT NULL DEFAULT 0,
    "preferences" TEXT,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "chauffeurId" INTEGER,
    "clientId" INTEGER,
    "startLocation" TEXT NOT NULL,
    "endLocation" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "estimatedDuration" TEXT NOT NULL,
    "currentLocation" TEXT,
    "estimatedPrice" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION,
    "paymentMethod" TEXT NOT NULL,
    "status" "StatutCourse" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "type" "TypeIncident" NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatutIncident" NOT NULL DEFAULT 'NON_RESOLU',
    "courseId" INTEGER,
    "chauffeurId" INTEGER,
    "vehiculeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "fichier" TEXT NOT NULL DEFAULT '',
    "mimeType" TEXT NOT NULL DEFAULT '',
    "taille" INTEGER NOT NULL DEFAULT 0,
    "dateExpiration" TIMESTAMP(3),
    "status" "StatutDocument" NOT NULL DEFAULT 'EN_ATTENTE',
    "chauffeurId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "cout" DOUBLE PRECISION NOT NULL,
    "kilometrage" INTEGER NOT NULL,
    "statut" "StatutMaintenance" NOT NULL DEFAULT 'PLANIFIE',
    "vehiculeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credit" (
    "id" SERIAL NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "chauffeurId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_email_key" ON "Chauffeur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_immatriculation_key" ON "Vehicule"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Credit_chauffeurId_key" ON "Credit"("chauffeurId");

-- AddForeignKey
ALTER TABLE "Chauffeur" ADD CONSTRAINT "Chauffeur_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarif" ADD CONSTRAINT "Tarif_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
