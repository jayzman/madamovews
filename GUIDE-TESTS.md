# Guide de Test - Système de Suivi Transport en Temps Réel

## 🚀 Préparation

### 1. Démarrer l'application
```powershell
cd f:\Niaiko\madamovews
npm run start:dev
```

### 2. Vérifier que la base de données est prête
```powershell
npx prisma migrate dev
npx prisma db seed
```

## 📋 Tests avec Postman

### Étape 1: Importer la collection
1. Ouvrir Postman
2. Importer le fichier `postman/Transport_RealTime_API.postman_collection.json`
3. La collection contient tous les endpoints nécessaires

### Étape 2: Configuration des variables
Dans Postman, configurer les variables d'environnement :
- `base_url`: `http://localhost:3000`
- `jwt_token`: (sera automatiquement rempli lors du login)
- `transport_id`: (sera automatiquement rempli lors de la création)

### Étape 3: Séquence de tests recommandée

#### A. Authentification
1. **Login Client**
   ```
   POST {{base_url}}/auth/login
   {
     "email": "client@example.com",
     "password": "password123"
   }
   ```
   ✅ Le token JWT sera automatiquement sauvegardé

2. **Login Chauffeur** (pour les tests de mise à jour de position)
   ```
   POST {{base_url}}/chauffeurs/login
   {
     "email": "chauffeur@example.com", 
     "password": "password123"
   }
   ```

#### B. Gestion du Transport
1. **Créer un Transport**
   ```
   POST {{base_url}}/transports
   {
     "clientId": 1,
     "vehiculeId": 1,
     "adresseDepart": "123 Rue de Rivoli, Paris",
     "adresseDestination": "456 Avenue des Champs-Élysées, Paris",
     "departLatitude": 48.8566,
     "departLongitude": 2.3522,
     "destinationLatitude": 48.8738,
     "destinationLongitude": 2.2950
   }
   ```
   ✅ L'ID du transport sera automatiquement sauvegardé

2. **Valider le Transport**
   ```
   POST {{base_url}}/transports/{{transport_id}}/valider/1
   ```

3. **Démarrer le Transport**
   ```
   POST {{base_url}}/transports/{{transport_id}}/start
   ```

#### C. Tests de Position
1. **Mettre à jour la Position**
   ```
   PATCH {{base_url}}/transports/{{transport_id}}/position
   {
     "latitude": 48.8606,
     "longitude": 2.3376,
     "statusInfo": "En route vers le client - Test Postman"
   }
   ```

2. **Obtenir la Position Actuelle**
   ```
   GET {{base_url}}/transports/{{transport_id}}/position
   ```

3. **Historique des Positions**
   ```
   GET {{base_url}}/transports/{{transport_id}}/position/history?limit=10
   ```

#### D. Tests de Suivi Automatique
1. **Démarrer le Suivi Automatique**
   ```
   POST {{base_url}}/transports/{{transport_id}}/tracking/start
   ```

2. **Obtenir les Statistiques**
   ```
   GET {{base_url}}/transports/tracking/statistics
   ```

3. **Arrêter le Suivi Automatique**
   ```
   POST {{base_url}}/transports/{{transport_id}}/tracking/stop
   ```

## 🌐 Tests WebSocket avec le navigateur

### Étape 1: Ouvrir l'interface de test
1. Ouvrir le fichier `test-websocket.html` dans votre navigateur
2. L'interface de test s'affiche avec plusieurs panneaux

### Étape 2: Configuration
1. **URL du serveur**: `http://localhost:3000` (déjà pré-rempli)
2. **Token JWT**: Copier le token obtenu depuis Postman
3. **Type d'utilisateur**: Choisir "Client" ou "Chauffeur"

### Étape 3: Tests WebSocket
1. **Se connecter**: Cliquer sur "Se connecter"
   - ✅ Statut devient "Connecté"
   - ✅ Message de confirmation dans les logs

2. **Rejoindre un Transport**: 
   - Entrer l'ID du transport créé avec Postman
   - Cliquer sur "Rejoindre"
   - ✅ Confirmation dans les logs

3. **Tests pour Chauffeur**:
   - **Position manuelle**: Modifier lat/lng et cliquer "Mettre à jour position"
   - **Position GPS**: Cliquer "📍 Ma position" pour utiliser la géolocalisation
   - **Suivi automatique**: Cliquer "Démarrer Auto" pour un envoi automatique

4. **Tests pour Client**:
   - Observer les mises à jour de position en temps réel
   - Voir les notifications d'ETA
   - Recevoir les alertes automatiques

## 🤖 Tests Automatisés avec PowerShell

### Exécution du script de test
```powershell
cd f:\Niaiko\madamovews
.\test-transport-api.ps1
```

### Options du script
```powershell
# Avec paramètres personnalisés
.\test-transport-api.ps1 -BaseUrl "http://localhost:3000" -ClientEmail "test@example.com"
```

### Que fait le script automatiquement :
1. ✅ Test d'authentification (client et chauffeur)
2. ✅ Création d'un transport
3. ✅ Validation du transport
4. ✅ Simulation de plusieurs mises à jour de position
5. ✅ Tests des changements de statut
6. ✅ Tests du suivi automatique
7. ✅ Fin du transport

## 🔍 Vérifications à effectuer

### Dans les logs de l'application (terminal)
Surveiller les messages suivants :
```
[TransportGateway] chauffeur 1 connecté avec socket abc123
[TransportGateway] Position mise à jour via WebSocket pour le transport 1
[PositionTrackingService] Suivi automatique démarré pour le transport 1
[TransportsService] ETA calculé pour le transport 1
```

### Dans la base de données
Vérifier que la table `Transport` contient :
- `positionActuelle` mis à jour avec les nouvelles coordonnées
- `updatedAt` mis à jour à chaque changement de position
- `status` qui évolue selon les tests

### Tests de performance
- Connecter plusieurs clients WebSocket simultanément
- Envoyer des mises à jour de position fréquentes (toutes les 5 secondes)
- Vérifier que les notifications arrivent en temps réel

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion WebSocket**
   ```
   connect_error: Unauthorized
   ```
   ➡️ Vérifier que le token JWT est valide et non expiré

2. **Position non mise à jour**
   ```
   error: Seuls les chauffeurs peuvent mettre à jour leur position
   ```
   ➡️ S'assurer d'être connecté avec un token de chauffeur

3. **Transport introuvable**
   ```
   error: Transport introuvable
   ```
   ➡️ Vérifier que l'ID du transport existe et que l'utilisateur a les permissions

4. **Erreur de calcul ETA**
   ```
   Erreur lors du calcul ETA: Invalid API key
   ```
   ➡️ Vérifier la variable d'environnement `GOOGLE_MAPS_API_KEY`

### Logs utiles
```powershell
# Voir les logs en temps réel
npm run start:dev

# Vérifier les connexions WebSocket actives
# (Consulter les logs dans la console du navigateur)
```

## 📊 Métriques à surveiller

### Performance
- Temps de réponse des API REST (< 200ms)
- Latence des WebSocket (< 50ms)
- Utilisation mémoire du service de suivi

### Fonctionnalité
- Précision du calcul d'ETA
- Fréquence des mises à jour de position
- Fiabilité des notifications automatiques

## 🎯 Scénarios de test avancés

### Test de montée en charge
1. Connecter 50+ clients WebSocket simultanément
2. Simuler 10+ transports actifs en parallèle
3. Envoyer des mises à jour toutes les 5 secondes

### Test de robustesse
1. Déconnecter/reconnecter les clients aléatoirement
2. Simuler des pannes réseau
3. Tester avec des positions GPS invalides

### Test d'intégration
1. Intégrer avec une vraie application mobile
2. Tester avec de vraies coordonnées GPS
3. Valider le calcul d'ETA avec des trajets réels
