/*
  Warnings:

  - The values [BASIC,CONFORT,FAMILIALE,VIP] on the enum `TypeVehicule` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Tarif` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeVehicule_new" AS ENUM ('VAN', 'BUS', 'BERLINE', 'SUV', 'AUTOCAR');
ALTER TABLE "Vehicule" ALTER COLUMN "type" TYPE "TypeVehicule_new" USING ("type"::text::"TypeVehicule_new");
ALTER TYPE "TypeVehicule" RENAME TO "TypeVehicule_old";
ALTER TYPE "TypeVehicule_new" RENAME TO "TypeVehicule";
DROP TYPE "TypeVehicule_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Tarif" DROP CONSTRAINT "Tarif_vehiculeId_fkey";

-- AlterTable
ALTER TABLE "Chauffeur" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE';

-- DropTable
DROP TABLE "Tarif";

-- DropEnum
DROP TYPE "TypeTarif";
