# Test des endpoints Codes Promo

## Test de l'endpoint de validation (sans DB)

```bash
curl -X POST http://localhost:3001/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST2025",
    "montantCourse": 50
  }'
```

## Test de l'endpoint de validation dans Transports

```bash
curl -X POST http://localhost:3001/api/transports/validate-promo-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST2025",
    "montantCourse": 50
  }'
```

## Test de la documentation Swagger

Accédez à : http://localhost:3001/api

## Vérification des endpoints disponibles

```bash
curl -X GET http://localhost:3001/api/promo-codes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Note: Ces tests échoueront tant que la migration Prisma n'est pas appliquée, mais ils permettent de vérifier que les routes sont bien configurées.
