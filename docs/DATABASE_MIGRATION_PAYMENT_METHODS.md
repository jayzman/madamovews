# Guide de Migration Base de Données - Modes de Paiement

## Modifications Prisma Schema

### 1. Ajouter le champ paymentMethod à la table Transport

```prisma
model Transport {
  // ... champs existants ...
  
  paymentMethod     String?   @default("STRIPE") // "STRIPE" ou "CASH"
  cashPaymentStatus String?   // "PENDING", "CONFIRMED", "DISPUTED"
  cashAmountReceived Float?   // Montant réellement reçu en espèces
  cashConfirmedAt   DateTime? // Date de confirmation du paiement espèces
  cashConfirmedBy   Int?      // ID du chauffeur qui a confirmé
  
  // ... autres champs ...
}
```

### 2. Migration SQL Équivalente

```sql
-- Ajouter le champ paymentMethod avec valeur par défaut
ALTER TABLE "Transport" 
ADD COLUMN "paymentMethod" TEXT DEFAULT 'STRIPE';

-- Ajouter les champs pour la gestion des paiements espèces
ALTER TABLE "Transport" 
ADD COLUMN "cashPaymentStatus" TEXT,
ADD COLUMN "cashAmountReceived" DOUBLE PRECISION,
ADD COLUMN "cashConfirmedAt" TIMESTAMP(3),
ADD COLUMN "cashConfirmedBy" INTEGER;

-- Mettre à jour les transports existants pour être explicitement STRIPE
UPDATE "Transport" 
SET "paymentMethod" = 'STRIPE' 
WHERE "paymentMethod" IS NULL;

-- Rendre le champ NOT NULL après mise à jour
ALTER TABLE "Transport" 
ALTER COLUMN "paymentMethod" SET NOT NULL;
```

### 3. Commandes Prisma

```bash
# Générer la migration
npx prisma migrate dev --name add_payment_methods

# Appliquer en production
npx prisma migrate deploy

# Regénérer le client
npx prisma generate
```

## Types TypeScript mis à jour

### 1. Enum PaymentMethod

```typescript
export enum PaymentMethod {
  STRIPE = "STRIPE",
  CASH = "CASH"
}

export enum CashPaymentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  DISPUTED = "DISPUTED"
}
```

### 2. Types de Transport mis à jour

```typescript
interface Transport {
  id: number;
  paymentMethod: PaymentMethod;
  cashPaymentStatus?: CashPaymentStatus;
  cashAmountReceived?: number;
  cashConfirmedAt?: Date;
  cashConfirmedBy?: number;
  // ... autres champs
}
```

## Données de Test

### Créer des transports de test

```sql
-- Transport avec paiement Stripe (existant)
INSERT INTO "Transport" (
  "clientId", "vehiculeId", "paymentMethod", 
  "adresseDepart", "adresseDestination", "status"
) VALUES (
  1, 1, 'STRIPE', 
  'Adresse A', 'Adresse B', 'EN_ATTENTE'
);

-- Transport avec paiement Cash
INSERT INTO "Transport" (
  "clientId", "vehiculeId", "paymentMethod",
  "adresseDepart", "adresseDestination", "status",
  "cashPaymentStatus"
) VALUES (
  2, 2, 'CASH',
  'Adresse C', 'Adresse D', 'EN_ATTENTE',
  'PENDING'
);
```

## Validation des Données

### Contraintes recommandées

```sql
-- Vérifier que paymentMethod est valide
ALTER TABLE "Transport" 
ADD CONSTRAINT "chk_payment_method" 
CHECK ("paymentMethod" IN ('STRIPE', 'CASH'));

-- Vérifier que cashPaymentStatus est valide (si défini)
ALTER TABLE "Transport" 
ADD CONSTRAINT "chk_cash_payment_status" 
CHECK ("cashPaymentStatus" IS NULL OR 
       "cashPaymentStatus" IN ('PENDING', 'CONFIRMED', 'DISPUTED'));

-- Si paiement CASH, cashPaymentStatus doit être défini
ALTER TABLE "Transport" 
ADD CONSTRAINT "chk_cash_status_required" 
CHECK (("paymentMethod" != 'CASH') OR 
       ("cashPaymentStatus" IS NOT NULL));
```

## Index Recommandés

```sql
-- Index pour les requêtes par mode de paiement
CREATE INDEX "idx_transport_payment_method" 
ON "Transport"("paymentMethod");

-- Index pour les paiements cash en attente
CREATE INDEX "idx_transport_cash_pending" 
ON "Transport"("paymentMethod", "cashPaymentStatus") 
WHERE "paymentMethod" = 'CASH' AND "cashPaymentStatus" = 'PENDING';

-- Index pour les confirmations de paiement
CREATE INDEX "idx_transport_cash_confirmed" 
ON "Transport"("cashConfirmedAt") 
WHERE "paymentMethod" = 'CASH';
```

## Rollback Plan

### En cas de problème

```sql
-- Sauvegarder les données avant migration
CREATE TABLE "Transport_backup" AS 
SELECT * FROM "Transport";

-- Rollback : supprimer les nouvelles colonnes
ALTER TABLE "Transport" 
DROP COLUMN IF EXISTS "paymentMethod",
DROP COLUMN IF EXISTS "cashPaymentStatus", 
DROP COLUMN IF EXISTS "cashAmountReceived",
DROP COLUMN IF EXISTS "cashConfirmedAt",
DROP COLUMN IF EXISTS "cashConfirmedBy";

-- Restaurer depuis la sauvegarde si nécessaire
-- (à adapter selon la situation)
```

## Vérifications Post-Migration

### Requêtes de validation

```sql
-- Vérifier que tous les transports ont un paymentMethod
SELECT COUNT(*) FROM "Transport" WHERE "paymentMethod" IS NULL;
-- Résultat attendu : 0

-- Vérifier la répartition des modes de paiement
SELECT "paymentMethod", COUNT(*) 
FROM "Transport" 
GROUP BY "paymentMethod";

-- Vérifier les contraintes cash
SELECT COUNT(*) FROM "Transport" 
WHERE "paymentMethod" = 'CASH' AND "cashPaymentStatus" IS NULL;
-- Résultat attendu : 0

-- Statistiques générales
SELECT 
  "paymentMethod",
  "status",
  COUNT(*) as count
FROM "Transport" 
GROUP BY "paymentMethod", "status"
ORDER BY "paymentMethod", "status";
```

Cette migration ajoute la flexibilité nécessaire pour supporter les deux modes de paiement tout en maintenant la compatibilité avec les données existantes.
