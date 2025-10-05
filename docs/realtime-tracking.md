# Système de Suivi de Transport en Temps Réel

Ce document explique comment utiliser le système de suivi de position en temps réel pour les transports.

## Vue d'ensemble

Le système de suivi en temps réel permet de :
- Suivre la position des chauffeurs en temps réel via WebSocket
- Calculer et afficher l'ETA (Estimated Time of Arrival)
- Détecter les déviations de route
- Notifier automatiquement les clients et chauffeurs
- Gérer le suivi automatique des transports

## Architecture

### Composants principaux

1. **TransportGateway** : Gère les connexions WebSocket
2. **PositionTrackingService** : Service dédié au suivi automatique
3. **TransportsService** : Logique métier principale
4. **UpdatePositionDto** : DTOs pour les mises à jour de position

### Base de données

Le champ `positionActuelle` dans la table `Transport` stocke la position actuelle au format JSON :
```json
{
  "lat": 48.8566,
  "lng": 2.3522
}
```

## Utilisation des WebSockets

### Connexion

**Namespace :** `/transport`

**Authentification :** Token JWT dans `auth.token` ou `headers.authorization`

```javascript
const socket = io('http://localhost:3000/transport', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Événements du client vers le serveur

#### 1. Rejoindre un transport
```javascript
socket.emit('join_transport', { transportId: 123 });
```

#### 2. Quitter un transport
```javascript
socket.emit('leave_transport', { transportId: 123 });
```

#### 3. Mettre à jour la position (chauffeurs uniquement)
```javascript
socket.emit('update_position', {
  transportId: 123,
  latitude: 48.8566,
  longitude: 2.3522,
  statusInfo: 'En route vers le client'
});
```

### Événements du serveur vers le client

#### 1. Mise à jour de position
```javascript
socket.on('position_update', (data) => {
  console.log('Nouvelle position:', data);
  // {
  //   transportId: 123,
  //   chauffeurId: 456,
  //   position: { lat: 48.8566, lng: 2.3522 },
  //   timestamp: '2025-06-12T10:30:00.000Z',
  //   statusInfo: 'En route vers le client'
  // }
});
```

#### 2. Mise à jour ETA
```javascript
socket.on('eta_update', (data) => {
  console.log('ETA mise à jour:', data);
  // {
  //   transportId: 123,
  //   estimatedArrival: '2025-06-12T11:00:00.000Z',
  //   distanceRemaining: 5.2,
  //   durationRemaining: 15,
  //   timestamp: '2025-06-12T10:30:00.000Z'TJM
  // }
});
```

#### 3. Notifications de transport
```javascript
socket.on('transport_notification', (data) => {
  console.log('Notification:', data);
  // {
  //   transportId: 123,
  //   message: 'Le chauffeur approche du point de ramassage',
  //   data: { distance: 0.8, eta: '2025-06-12T10:35:00.000Z' },
  //   timestamp: '2025-06-12T10:30:00.000Z'
  // }
});
```

## API REST

### Endpoints principaux

#### 1. Mettre à jour la position
```http
PATCH /transports/:id/position
Content-Type: application/json

{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "statusInfo": "En route vers le client"
}
```

#### 2. Obtenir la position actuelle
```http
GET /transports/:id/position
```

#### 3. Historique des positions
```http
GET /transports/:id/position/history?limit=50
```

#### 4. Démarrer le suivi automatique
```http
POST /transports/:id/tracking/start
```

#### 5. Arrêter le suivi automatique
```http
POST /transports/:id/tracking/stop
```

#### 6. Statistiques de suivi
```http
GET /transports/tracking/statistics
```

## Fonctionnalités automatiques

### Suivi automatique

Quand un transport démarre (`status: EN_COURSE`), le suivi automatique s'active :
- Vérification toutes les 30 secondes
- Calcul automatique de l'ETA
- Détection des déviations de route
- Alertes si pas de mise à jour > 5 minutes

### Notifications automatiques

- **Approche de destination** : Quand le chauffeur est à moins d'1 km
- **Retard de position** : Si pas de mise à jour depuis 5+ minutes
- **Déviation de route** : Si le trajet semble anormal

### Calcul d'ETA

L'ETA est calculé automatiquement en utilisant l'API Google Maps :
- Position actuelle vers point de ramassage (EN_ROUTE_RAMASSAGE)
- Position actuelle vers destination finale (EN_COURSE)

## Intégration dans une application frontend

### React/Vue.js exemple

```javascript
import io from 'socket.io-client';

class TransportTracker {
  constructor(transportId, token) {
    this.transportId = transportId;
    this.socket = io('http://localhost:3000/transport', {
      auth: { token }
    });
    
    this.setupEventListeners();
    this.joinTransport();
  }
  
  setupEventListeners() {
    this.socket.on('connected', (data) => {
      console.log('Connecté:', data);
    });
    
    this.socket.on('position_update', (data) => {
      this.updateMapPosition(data.position);
      this.updateUI(data);
    });
    
    this.socket.on('eta_update', (data) => {
      this.updateETA(data);
    });
    
    this.socket.on('transport_notification', (data) => {
      this.showNotification(data.message);
    });
  }
  
  joinTransport() {
    this.socket.emit('join_transport', { 
      transportId: this.transportId 
    });
  }
  
  updatePosition(lat, lng, statusInfo = '') {
    this.socket.emit('update_position', {
      transportId: this.transportId,
      latitude: lat,
      longitude: lng,
      statusInfo
    });
  }
  
  updateMapPosition(position) {
    // Mettre à jour la carte avec la nouvelle position
  }
  
  updateETA(etaData) {
    // Mettre à jour l'affichage de l'ETA
  }
  
  showNotification(message) {
    // Afficher une notification à l'utilisateur
  }
  
  disconnect() {
    this.socket.emit('leave_transport', { 
      transportId: this.transportId 
    });
    this.socket.disconnect();
  }
}
```

## Configuration

### Variables d'environnement requises

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
JWT_SECRET=your_jwt_secret
```

### Permissions

- **Chauffeurs** : Peuvent mettre à jour leur position
- **Clients** : Peuvent suivre leurs transports
- **Admins** : Accès complet aux statistiques

## Dépannage

### Problèmes courants

1. **WebSocket ne se connecte pas**
   - Vérifier le token JWT
   - Vérifier l'URL du namespace `/transport`

2. **Pas de mises à jour de position**
   - Vérifier que le chauffeur est assigné au transport
   - Vérifier les permissions du token

3. **ETA incorrect**
   - Vérifier la clé API Google Maps
   - Vérifier que les coordonnées sont valides

### Logs

Les logs sont disponibles avec le niveau `DEBUG` :
- `TransportGateway` : Connexions WebSocket
- `PositionTrackingService` : Suivi automatique
- `TransportsService` : Logique métier

## Améliorations futures

1. **Historique des positions** : Table dédiée pour stocker toutes les positions
2. **Géofencing** : Alertes quand le véhicule entre/sort de zones
3. **Prédictions ML** : Prédire les retards basés sur l'historique
4. **Optimisation de route** : Suggestions de routes alternatives
