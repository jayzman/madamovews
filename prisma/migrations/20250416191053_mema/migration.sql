/*
  Warnings:

  - The values [STANDARD,PREMIUM,VIP] on the enum `TypeTarif` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeTarif_new" AS ENUM ('LOCATION_JOURNALIERE', 'AEROPORT', 'AEROPORT_JOUR', 'AEROPORT_NUIT', 'PAR_HEURE_JOUR', 'PAR_HEURE_NUIT');
ALTER TABLE "Tarif" ALTER COLUMN "type" TYPE "TypeTarif_new" USING ("type"::text::"TypeTarif_new");
ALTER TYPE "TypeTarif" RENAME TO "TypeTarif_old";
ALTER TYPE "TypeTarif_new" RENAME TO "TypeTarif";
DROP TYPE "TypeTarif_old";
COMMIT;
