# Implémentation des Modes de Paiement - Guide Frontend

## Vue d'ensemble

L'application MADAMOVE supporte maintenant deux modes de paiement :
- **STRIPE** : Paiement électronique sécurisé (existant)
- **CASH** : Paiement en espèces (nouveau)

## 1. Création d'un Transport avec Choix du Mode de Paiement

### Interface Utilisateur

#### Sélecteur de Mode de Paiement
```
┌─────────────────────────────────────┐
│ 💳 Mode de paiement                 │
├─────────────────────────────────────┤
│ ○ Carte bancaire (Stripe)           │
│ ● Espèces                          │
└─────────────────────────────────────┘
```

#### Affichage Conditionnel
- **STRIPE sélectionné** : Afficher l'estimation + "Paiement sécurisé"
- **CASH sélectionné** : Afficher l'estimation + "Paiement en espèces à la fin du trajet"

### Payload API

#### Endpoint : `POST /transports`

```json
{
  "clientId": 1,
  "vehiculeId": 2,
  "adresseDepart": "123 rue de Paris, 75001 Paris",
  "adresseDestination": "456 avenue des Champs-Élysées, 75008 Paris",
  "departLatitude": 48.8566,
  "departLongitude": 2.3522,
  "destinationLatitude": 48.8534,
  "destinationLongitude": 2.3488,
  "paymentMethod": "CASH"  // Nouveau champ : "STRIPE" ou "CASH"
}
```

### Réponses API Différentiées

#### Réponse pour STRIPE
```json
{
  "transport": { ... },
  "paymentMethod": "STRIPE",
  "setupUrl": "https://checkout.stripe.com/session/...",
  "sessionId": "sess_abc123xyz"
}
```

#### Réponse pour CASH
```json
{
  "transport": { ... },
  "paymentMethod": "CASH",
  "message": "Transport créé avec succès. Paiement en espèces à la fin du trajet."
}
```

## 2. Flux Frontend par Mode de Paiement

### Flux STRIPE (Existant - Inchangé)

1. **Création** → Redirection vers Stripe Checkout
2. **Configuration** → Retour app → Finalisation
3. **Validation** → Chauffeur accepte
4. **Transport** → Suivi temps réel
5. **Fin** → Paiement automatique capturé

### Flux CASH (Nouveau)

1. **Création** → Confirmation directe (pas de Stripe)
2. **Validation** → Chauffeur accepte directement
3. **Transport** → Suivi temps réel
4. **Fin** → Interface de confirmation paiement espèces
5. **Confirmation** → Chauffeur confirme réception paiement

## 3. Interface de Confirmation Paiement Espèces

### Écran Chauffeur (Fin de Course)

```
┌─────────────────────────────────────┐
│ 🚗 Course terminée                  │
├─────────────────────────────────────┤
│ Montant à percevoir: 25,50€         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Montant reçu: [    ] €          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  ✅ Confirmer paiement reçu     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Endpoint de Confirmation

#### `POST /transports/:id/confirm-cash-payment`

```json
{
  "chauffeurId": 1,
  "montantRecu": 25.50
}
```

## 4. États et Statuts des Transports

### Statuts Communs
- `EN_ATTENTE` : Transport créé
- `VALIDE` : Chauffeur accepté
- `EN_COURSE` : Transport en cours
- `TERMINE` : Transport terminé

### Gestion des États par Mode

#### STRIPE
- Vérifications de paiement à chaque étape
- Capture automatique à la fin
- Gestion des erreurs Stripe

#### CASH
- Pas de vérification paiement pendant le transport
- Confirmation manuelle à la fin
- Notifications de rappel

## 5. Composants Frontend à Créer/Modifier

### Composants Nouveaux

#### `PaymentMethodSelector`
- Radio buttons pour STRIPE/CASH
- Descriptions des modes
- Validation des choix

#### `CashPaymentConfirmation`
- Interface chauffeur fin de course
- Saisie montant reçu
- Bouton confirmation

#### `PaymentStatusIndicator`
- Affichage mode de paiement
- États différenciés
- Icônes appropriées

### Composants à Modifier

#### `TransportCreation`
- Ajouter sélecteur mode paiement
- Logique conditionnelle post-création
- Gestion des réponses différentiées

#### `TransportDetails`
- Afficher mode de paiement
- Interfaces conditionnelles
- Statuts de paiement

#### `DriverDashboard`
- Interface confirmation espèces
- Notifications paiement
- Historique par mode

## 6. Notifications et Messages

### Messages Client

#### Transport CASH Créé
> "Transport réservé ! Paiement en espèces de [MONTANT]€ à prévoir à la fin du trajet."

#### Transport CASH Validé
> "Votre chauffeur a accepté votre course. Le paiement se fera en espèces à la fin du trajet."

#### Paiement CASH Confirmé
> "Le chauffeur a confirmé avoir reçu [MONTANT]€ en espèces. Merci pour votre confiance !"

### Messages Chauffeur

#### Transport CASH Assigné
> "Nouveau transport assigné. Paiement en espèces de [MONTANT]€ à percevoir."

#### Rappel Paiement
> "N'oubliez pas de confirmer la réception du paiement en espèces dans l'app."

## 7. Indicateurs Visuels

### Icônes et Couleurs

#### Mode STRIPE
- 💳 Icône carte bancaire
- 🟢 Couleur verte (sécurisé)
- Badge "Paiement sécurisé"

#### Mode CASH
- 💰 Icône espèces
- 🟡 Couleur jaune (attention)
- Badge "Paiement espèces"

### États de Paiement

#### STRIPE
- ✅ Configuré
- ⏳ En attente
- 💳 Capturé
- ❌ Échoué

#### CASH
- 💰 À percevoir
- ⏳ En attente confirmation
- ✅ Confirmé
- ⚠️ Non confirmé

## 8. Gestion des Erreurs

### Erreurs Spécifiques CASH

#### Transport Non Terminé
> "Le transport doit être terminé avant de confirmer le paiement en espèces."

#### Chauffeur Non Autorisé
> "Seul le chauffeur du transport peut confirmer la réception du paiement."

#### Mode Paiement Incorrect
> "Cette action n'est disponible que pour les paiements en espèces."

## 9. Analytics et Reporting

### Métriques à Tracker

#### Par Mode de Paiement
- Nombre de transports STRIPE vs CASH
- Montants moyens par mode
- Taux d'abandon par mode
- Temps de confirmation (CASH)

#### Indicateurs Chauffeurs
- Pourcentage confirmations espèces
- Délai moyen de confirmation
- Écarts montants estimés/reçus

## 10. Tests Frontend

### Tests à Implémenter

#### Tests Unitaires
- Sélecteur mode paiement
- Validation formulaires
- Affichage conditionnel

#### Tests d'Intégration
- Flux complet CASH
- Transitions d'états
- Gestion erreurs

#### Tests E2E
- Parcours client CASH complet
- Parcours chauffeur confirmation
- Notifications cross-platform

## 11. Migration et Déploiement

### Stratégie de Déploiement

#### Phase 1 : Backend
- Déploiement API avec support CASH
- Tests en environnement staging
- Monitoring logs paiements

#### Phase 2 : Frontend
- Déploiement sélecteur mode paiement
- Tests utilisateurs bêta
- Rollback possible sur STRIPE seul

#### Phase 3 : Activation Complète
- Communication utilisateurs
- Formation chauffeurs
- Monitoring analytics

### Rétrocompatibilité
- Transports existants restent STRIPE
- Pas de champ paymentMethod = STRIPE par défaut
- Interfaces existantes inchangées

---

## Résumé des Endpoints API

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `POST /transports` | POST | Créer transport avec mode paiement |
| `POST /transports/:id/valider/:chauffeurId` | POST | Valider transport (géré auto) |
| `POST /transports/:id/confirm-cash-payment` | POST | Confirmer paiement espèces |
| `GET /transports/:id` | GET | Détails avec mode paiement |

## Types TypeScript Suggérés

```typescript
enum PaymentMethod {
  STRIPE = "STRIPE",
  CASH = "CASH"
}

interface Transport {
  id: number;
  paymentMethod?: PaymentMethod;
  // ... autres champs
}

interface CreateTransportRequest {
  // ... champs existants
  paymentMethod?: PaymentMethod;
}

interface CashPaymentConfirmation {
  chauffeurId: number;
  montantRecu: number;
}
```

Cette implémentation garantit une expérience utilisateur fluide tout en maintenant la sécurité et la traçabilité des paiements.
