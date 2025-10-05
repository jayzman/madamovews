# Configuration Twilio pour SMS et OTP - Guide d'utilisation

## 📱 Configuration Twilio

### Variables d'environnement requises
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

## 🚗 API Chauffeurs avec SMS/OTP

### 1. Inscription d'un chauffeur via SMS
```http
POST /chauffeurs/register-sms
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33123456789",
  "statut": "SALARIE",
  "email": "jean.dupont@example.com", // optionnel
  "vehiculeId": 1 // optionnel
}
```

**Réponse :**
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33123456789",
  "statut": "SALARIE",
  "statutActivite": "ACTIF",
  "vehicule": null,
  "credits": {
    "id": 1,
    "solde": 0
  }
}
```

### 2. Connexion d'un chauffeur via SMS

#### Étape 1 : Demander un code OTP
```http
POST /chauffeurs/send-otp
Content-Type: application/json

{
  "telephone": "+33123456789"
}
```

**Réponse :**
```json
{
  "message": "Code OTP envoyé avec succès",
  "telephone": "+33123456789"
}
```

#### Étape 2 : Vérifier le code OTP et se connecter
```http
POST /chauffeurs/verify-otp
Content-Type: application/json

{
  "telephone": "+33123456789",
  "otp": "123456"
}
```

**Réponse :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "chauffeur": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+33123456789",
    "statut": "SALARIE",
    "vehicule": null,
    "credits": {
      "id": 1,
      "solde": 0
    }
  }
}
```

#### Alternative : Connexion directe avec OTP
```http
POST /chauffeurs/login-sms
Content-Type: application/json

{
  "telephone": "+33123456789",
  "otp": "123456"
}
```

### 3. Renvoyer un code OTP
```http
POST /chauffeurs/resend-otp
Content-Type: application/json

{
  "telephone": "+33123456789"
}
```

### 4. Envoyer un SMS personnalisé
```http
POST /chauffeurs/send-custom-sms
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": ["+33123456789", "+33987654321"],
  "message": "Votre course est confirmée. Le chauffeur arrivera dans 5 minutes."
}
```

**Réponse :**
```json
{
  "success": true,
  "results": [
    {
      "to": "+33123456789",
      "success": true,
      "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "status": "queued"
    },
    {
      "to": "+33987654321",
      "success": true,
      "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "status": "queued"
    }
  ]
}
```

## 👤 API Clients avec SMS/OTP

### 1. Inscription d'un client via SMS
```http
POST /clients/register-sms
Content-Type: application/json

{
  "nom": "Martin",
  "prenom": "Sophie",
  "telephone": "+33123456789",
  "email": "sophie.martin@example.com", // optionnel
  "adresse": "123 Rue de Paris", // optionnel
  "ville": "Paris" // optionnel
}
```

### 2. Connexion d'un client via SMS

#### Étape 1 : Demander un code OTP
```http
POST /clients/send-otp
Content-Type: application/json

{
  "telephone": "+33123456789"
}
```

#### Étape 2 : Vérifier le code OTP et se connecter
```http
POST /clients/verify-otp
Content-Type: application/json

{
  "telephone": "+33123456789",
  "otp": "123456"
}
```

#### Alternative : Connexion directe avec OTP
```http
POST /clients/login-sms
Content-Type: application/json

{
  "telephone": "+33123456789",
  "otp": "123456"
}
```

### 3. Renvoyer un code OTP pour client
```http
POST /clients/resend-otp
Content-Type: application/json

{
  "telephone": "+33123456789"
}
```

### 4. Envoyer un SMS personnalisé aux clients
```http
POST /clients/send-custom-sms
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": ["+33123456789", "+33987654321"],
  "message": "Votre réservation est confirmée. Merci de votre confiance !"
}
```

## 📲 API SMS Générique

### 1. Envoyer un SMS personnalisé
```http
POST /sms/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": ["+33123456789", "+33987654321"],
  "message": "Message personnalisé"
}
```

### 2. Envoyer un code OTP
```http
POST /sms/send-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+33123456789"
}
```

### 3. Vérifier un code OTP
```http
POST /sms/verify-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+33123456789",
  "otp": "123456"
}
```

### 4. Renvoyer un code OTP
```http
POST /sms/resend-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "+33123456789"
}
```

## 🔧 Fonctionnalités du SmsService

### Génération et gestion d'OTP
- **Génération automatique** : Code OTP à 6 chiffres
- **Expiration** : 5 minutes par défaut
- **Stockage temporaire** : En mémoire (Map) - recommandé d'utiliser Redis en production
- **Vérification** : Validation du code et de l'expiration
- **Nettoyage automatique** : Suppression après vérification réussie

### Envoi de SMS
- **Simple** : Envoi à un destinataire
- **Multiple** : Envoi à plusieurs destinataires
- **Personnalisé** : Messages sur mesure
- **Gestion d'erreurs** : Rapport détaillé des succès/échecs

### Configuration de sécurité
- **Validation du numéro** : Format international requis
- **Authentification** : JWT requis pour certains endpoints
- **Rate limiting** : À implémenter pour éviter le spam

## 📋 Format des numéros de téléphone

Tous les numéros doivent être au format international :
- ✅ `+33123456789` (France)
- ✅ `+1234567890` (USA)
- ✅ `+221123456789` (Sénégal)
- ❌ `0123456789` (format local)

## 🚀 Déploiement et Production

### Variables d'environnement de production
```env
TWILIO_ACCOUNT_SID=votre_account_sid_production
TWILIO_AUTH_TOKEN=votre_auth_token_production
TWILIO_PHONE_NUMBER=votre_numero_twilio
```

### Recommandations pour la production
1. **Redis** : Utiliser Redis pour stocker les OTP au lieu de la mémoire
2. **Rate Limiting** : Implémenter une limitation du nombre de SMS par IP/utilisateur
3. **Logs** : Ajouter des logs détaillés pour le monitoring
4. **Webhook** : Configurer les webhooks Twilio pour le statut des messages
5. **Fallback** : Implémenter un système de fallback en cas d'échec

## 🎯 Exemples d'utilisation

### Frontend JavaScript
```javascript
// Inscription chauffeur via SMS
const registerDriver = async (driverData) => {
  const response = await fetch('/chauffeurs/register-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(driverData)
  });
  return response.json();
};

// Connexion via OTP
const loginWithOTP = async (telephone, otp) => {
  const response = await fetch('/chauffeurs/login-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ telephone, otp })
  });
  return response.json();
};

// Envoyer SMS personnalisé
const sendCustomSMS = async (recipients, message, token) => {
  const response = await fetch('/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      to: recipients,
      message: message
    })
  });
  return response.json();
};
```

## 🛡️ Sécurité

### Authentification
- Les endpoints publics (`/register-sms`, `/send-otp`, `/verify-otp`) ne nécessitent pas d'authentification
- Les endpoints d'envoi de SMS personnalisés nécessitent un JWT valide
- Les OTP expirent automatiquement après 5 minutes

### Validation
- Tous les numéros de téléphone sont validés au format international
- Les codes OTP sont des nombres à 6 chiffres
- Validation des données d'entrée avec class-validator

### Best Practices
- Ne jamais exposer les codes OTP dans les logs
- Implémenter un rate limiting pour éviter l'abus
- Utiliser HTTPS en production
- Stocker les OTP de manière sécurisée (Redis avec expiration)
