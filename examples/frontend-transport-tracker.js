/**
 * Exemple d'intégration Frontend pour le suivi en temps réel
 * Compatible avec React, Vue.js, Angular ou Vanilla JavaScript
 */

import io from 'socket.io-client';

class TransportRealTimeTracker {
  constructor(config) {
    this.config = {
      serverUrl: 'http://localhost:3000',
      namespace: '/transport',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config
    };
    
    this.socket = null;
    this.transportId = null;
    this.userType = null; // 'client' ou 'chauffeur'
    this.isConnected = false;
    
    // Callbacks d'événements
    this.eventCallbacks = {
      onPositionUpdate: [],
      onETAUpdate: [],
      onStatusUpdate: [],
      onNotification: [],
      onConnected: [],
      onDisconnected: [],
      onError: []
    };
  }

  /**
   * Se connecter au serveur WebSocket
   * @param {string} token - Token JWT pour l'authentification
   * @param {string} userType - Type d'utilisateur ('client' ou 'chauffeur')
   */
  connect(token, userType = 'client') {
    this.userType = userType;
    
    this.socket = io(`${this.config.serverUrl}${this.config.namespace}`, {
      auth: { token },
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay
    });

    this.setupEventListeners();
    
    return new Promise((resolve, reject) => {
      this.socket.on('connected', (data) => {
        this.isConnected = true;
        console.log('Connecté au service de transport:', data);
        this.triggerCallbacks('onConnected', data);
        resolve(data);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Erreur de connexion:', error);
        this.triggerCallbacks('onError', { type: 'connection', error });
        reject(error);
      });
    });
  }

  /**
   * Configuration des écouteurs d'événements
   */
  setupEventListeners() {
    // Mise à jour de position
    this.socket.on('position_update', (data) => {
      console.log('Position mise à jour:', data);
      this.triggerCallbacks('onPositionUpdate', data);
    });

    // Mise à jour ETA
    this.socket.on('eta_update', (data) => {
      console.log('ETA mise à jour:', data);
      this.triggerCallbacks('onETAUpdate', data);
    });

    // Mise à jour de statut
    this.socket.on('status_update', (data) => {
      console.log('Statut mis à jour:', data);
      this.triggerCallbacks('onStatusUpdate', data);
    });

    // Notifications
    this.socket.on('transport_notification', (data) => {
      console.log('Notification transport:', data);
      this.triggerCallbacks('onNotification', data);
    });

    this.socket.on('notification', (data) => {
      console.log('Notification:', data);
      this.triggerCallbacks('onNotification', data);
    });

    // Événements de connexion
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Déconnecté:', reason);
      this.triggerCallbacks('onDisconnected', { reason });
    });

    this.socket.on('error', (error) => {
      console.error('Erreur WebSocket:', error);
      this.triggerCallbacks('onError', { type: 'socket', error });
    });

    // Événements de suivi
    this.socket.on('tracking_started', (data) => {
      console.log('Suivi démarré:', data);
    });

    this.socket.on('tracking_stopped', (data) => {
      console.log('Suivi arrêté:', data);
    });
  }

  /**
   * Rejoindre un transport pour le suivi
   * @param {number} transportId - ID du transport à suivre
   */
  async joinTransport(transportId) {
    if (!this.isConnected) {
      throw new Error('Non connecté au serveur');
    }

    this.transportId = transportId;
    
    return new Promise((resolve, reject) => {
      this.socket.emit('join_transport', { transportId });
      
      this.socket.once('transport_joined', (data) => {
        console.log('Transport rejoint:', data);
        resolve(data);
      });

      this.socket.once('error', (error) => {
        console.error('Erreur lors de la jointure:', error);
        reject(error);
      });
    });
  }

  /**
   * Quitter le suivi d'un transport
   */
  async leaveTransport() {
    if (!this.transportId) return;

    return new Promise((resolve) => {
      this.socket.emit('leave_transport', { transportId: this.transportId });
      
      this.socket.once('transport_left', (data) => {
        console.log('Transport quitté:', data);
        this.transportId = null;
        resolve(data);
      });
    });
  }

  /**
   * Mettre à jour la position (chauffeurs uniquement)
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} statusInfo - Information optionnelle sur le statut
   */
  updatePosition(latitude, longitude, statusInfo = '') {
    if (!this.isConnected || !this.transportId) {
      throw new Error('Non connecté ou pas de transport actif');
    }

    if (this.userType !== 'chauffeur') {
      throw new Error('Seuls les chauffeurs peuvent mettre à jour leur position');
    }

    this.socket.emit('update_position', {
      transportId: this.transportId,
      latitude,
      longitude,
      statusInfo
    });
  }

  /**
   * Ajouter un écouteur d'événement
   * @param {string} event - Type d'événement
   * @param {Function} callback - Fonction de callback
   */
  on(event, callback) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].push(callback);
    }
  }

  /**
   * Supprimer un écouteur d'événement
   * @param {string} event - Type d'événement
   * @param {Function} callback - Fonction de callback à supprimer
   */
  off(event, callback) {
    if (this.eventCallbacks[event]) {
      const index = this.eventCallbacks[event].indexOf(callback);
      if (index > -1) {
        this.eventCallbacks[event].splice(index, 1);
      }
    }
  }

  /**
   * Déclencher les callbacks pour un événement
   * @param {string} event - Type d'événement
   * @param {*} data - Données à passer aux callbacks
   */
  triggerCallbacks(event, data) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erreur dans le callback ${event}:`, error);
        }
      });
    }
  }

  /**
   * Se déconnecter
   */
  disconnect() {
    if (this.socket) {
      if (this.transportId) {
        this.leaveTransport();
      }
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Obtenir l'état de la connexion
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      transportId: this.transportId,
      userType: this.userType,
      socketId: this.socket?.id
    };
  }
}

// Classe utilitaire pour l'API REST
class TransportAPI {
  constructor(baseURL = 'http://localhost:3000', token = null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Méthodes API pour les transports
  async updatePosition(transportId, latitude, longitude, statusInfo = '') {
    return this.request(`/transports/${transportId}/position`, {
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude, statusInfo })
    });
  }

  async getCurrentPosition(transportId) {
    return this.request(`/transports/${transportId}/position`);
  }

  async getPositionHistory(transportId, limit = 50) {
    return this.request(`/transports/${transportId}/position/history?limit=${limit}`);
  }

  async startTracking(transportId) {
    return this.request(`/transports/${transportId}/tracking/start`, {
      method: 'POST'
    });
  }

  async stopTracking(transportId) {
    return this.request(`/transports/${transportId}/tracking/stop`, {
      method: 'POST'
    });
  }

  async getTrackingStats() {
    return this.request('/transports/tracking/statistics');
  }
}

// Exemple d'utilisation
export { TransportRealTimeTracker, TransportAPI };

/* 
// Exemple d'utilisation dans une application React/Vue/Angular

import { TransportRealTimeTracker, TransportAPI } from './transport-tracker';

// Initialisation
const tracker = new TransportRealTimeTracker({
  serverUrl: 'http://localhost:3000'
});

const api = new TransportAPI('http://localhost:3000', 'your-jwt-token');

// Pour un client
async function startClientTracking(transportId, token) {
  try {
    // Se connecter
    await tracker.connect(token, 'client');
    
    // Rejoindre le transport
    await tracker.joinTransport(transportId);
    
    // Écouter les mises à jour
    tracker.on('onPositionUpdate', (data) => {
      console.log('Nouvelle position du chauffeur:', data.position);
      // Mettre à jour la carte
      updateMapWithPosition(data.position);
    });
    
    tracker.on('onETAUpdate', (data) => {
      console.log('ETA mis à jour:', data);
      // Mettre à jour l'interface utilisateur
      updateETADisplay(data.estimatedArrival, data.durationRemaining);
    });
    
    tracker.on('onNotification', (data) => {
      console.log('Notification:', data.message);
      // Afficher une notification
      showNotification(data.message);
    });
    
  } catch (error) {
    console.error('Erreur lors du démarrage du suivi:', error);
  }
}

// Pour un chauffeur
async function startDriverTracking(transportId, token) {
  try {
    await tracker.connect(token, 'chauffeur');
    await tracker.joinTransport(transportId);
    
    // Démarrer le suivi automatique de position (si géolocalisation disponible)
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          tracker.updatePosition(
            position.coords.latitude,
            position.coords.longitude,
            'Position automatique'
          );
        },
        (error) => console.error('Erreur géolocalisation:', error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    }
    
  } catch (error) {
    console.error('Erreur lors du démarrage du suivi chauffeur:', error);
  }
}

// Fonctions utilitaires (à implémenter selon votre interface)
function updateMapWithPosition(position) {
  // Mettre à jour votre carte (Google Maps, Leaflet, etc.)
}

function updateETADisplay(estimatedArrival, durationMinutes) {
  // Mettre à jour l'affichage de l'ETA
}

function showNotification(message) {
  // Afficher une notification utilisateur
}
*/
