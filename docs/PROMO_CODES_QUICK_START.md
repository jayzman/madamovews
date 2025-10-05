# 🚀 Guide de Mise en Œuvre - Codes Promo

## Installation et Configuration

### 1. Application de la migration

```bash
# Appliquer les changements de schéma à la base de données
npx prisma migrate dev --name add_promo_codes_with_description

# Générer le client Prisma mis à jour
npx prisma generate
```

### 2. Test de l'API

#### Créer un code promo (Admin)
```bash
curl -X POST http://localhost:3001/api/promo-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "WELCOME2025",
    "description": "Code de bienvenue pour nouveaux clients",
    "typeReduction": "PERCENTAGE",
    "valeurReduction": 20,
    "dateExpiration": "2025-12-31T23:59:59Z",
    "utilisationsMax": 100,
    "montantMinimum": 25
  }'
```

#### Valider un code promo (Public)
```bash
curl -X POST http://localhost:3001/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME2025",
    "montantCourse": 50
  }'
```

#### Créer un transport avec code promo
```bash
curl -X POST http://localhost:3001/api/transports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "clientId": 1,
    "vehiculeId": 1,
    "adresseDepart": "123 rue de la Paix, Paris",
    "adresseDestination": "456 avenue des Champs, Paris",
    "departLatitude": 48.8566,
    "departLongitude": 2.3522,
    "destinationLatitude": 48.8738,
    "destinationLongitude": 2.2950,
    "paymentMethod": "STRIPE",
    "promoCode": "WELCOME2025"
  }'
```

## Prochaines étapes

### 1. Interface d'administration
Créer une interface pour que les admins puissent gérer les codes promo facilement.

### 2. Analytics
Implémenter un tableau de bord pour suivre :
- Utilisation des codes promo
- Montants des réductions
- Codes les plus populaires

### 3. Améliorations possibles
- Codes promo à usage unique par utilisateur
- Codes promo conditionnels (ex: première course uniquement)
- Codes promo géolocalisés
- Codes promo avec limite de temps (ex: valide 1h après création)

## Support

Pour toute question, consultez la documentation complète dans `PROMO_CODES_FLOW.md`.
