# DriveEasy Frontend - Application Web de Gestion de Location de Véhicules

Interface utilisateur moderne développée avec **Angular 22** (Standalone Components) et **Bootstrap 5**, destinée aux agents d'agence de la plateforme **DriveEasy**.

L'application consomme l'ensemble des API REST exposées de manière centralisée par l'**API Gateway Spring Cloud** sur `http://localhost:8080`.

---

## 🚀 Fonctionnalités Implémentées

- 📊 **Tableau de Bord (`/dashboard`)** :
  - Métriques clés en temps réel : nombre total de véhicules, véhicules disponibles, loués et en maintenance.
  - Taux d'occupation dynamique du parc et chiffre d'affaires cumulé.
  - Suivi des locations récentes et alertes.

- 🚗 **Catalogue des Véhicules (`/vehicules`)** :
  - Grille moderne de cartes véhicules avec visuels, immatriculation, caractéristiques (carburant, boîte de vitesse, places, km).
  - Filtres dynamiques combinables : par carburant (Essence, Diesel, Électrique, Hybride), statut et prix maximum par jour.
  - Formulaires réactifs de création (`/vehicules/new`) et de modification (`/vehicules/:id/edit`) avec validations strictes.

- 👥 **Gestion des Clients (`/clients`)** :
  - Répertoire complet des clients avec badges de fidélité (**STANDARD**, **FIDELE -5%**, **VIP -10%**).
  - Contrôle d'éligibilité en direct (âge minimum $\ge 21$ ans et validité du permis de conduire).
  - Fiche détaillée (`/clients/:id`) avec récapitulatif complet et historique de toutes ses locations.

- 🔑 **Assistant de Location en Étapes (`/locations/new`)** :
  - **Étape 1** : Sélection du client et vérification instantanée de son éligibilité.
  - **Étape 2** : Choix des dates de début et de fin prévue.
  - **Étape 3** : Sélection parmi les véhicules disponibles sur la période demandée.
  - **Étape 4** : Simulation tarifaire automatique (calcul des jours, tarif journalier, remise fidélité appliquée, montant net) et confirmation.

- 📋 **Gestion et Clôture des Locations (`/locations`)** :
  - Liste complète filtrable par statut (`RESERVEE`, `EN_COURS`, `TERMINEE`, `ANNULEE`).
  - Démarrage de location (passage du statut à `EN_COURS` et mise à jour du statut véhicule à `LOUE`).
  - Retour de véhicule (`/locations/:id/retour`) : saisie du kilométrage effectif, calcul automatique des pénalités de retard ($1.5 \times \text{tarifJournalier} \times \text{joursRetard}$) et libération du véhicule (`DISPONIBLE`).
  - Génération d'une **Fiche de restitution / Facture finale imprimable**.

---

## 🛠️ Prérequis

- **Node.js 18+** ou **20+**
- **npm** (inclus avec Node.js)
- Le backend **DriveEasy** démarré (API Gateway sur `http://localhost:8080`)

---

## 📦 Installation et Lancement

### 1. Installer les dépendances
```bash
cd driveeasy-frontend
npm install
```

### 2. Démarrer le serveur de développement
```bash
npm start
```
ou :
```bash
npx ng serve --port 4200 --proxy-config proxy.conf.json
```

L'application sera accessible sur : **`http://localhost:4200`**

---

## 🌐 Configuration du Proxy API

Le fichier `proxy.conf.json` redirige de manière transparente tous les appels `/api/*` vers l'API Gateway Spring Cloud :

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 🏗️ Structure du Projet

```text
src/app/
├── models/
│   ├── vehicule.model.ts      # Types Carburant, Statut, Interface Vehicule
│   ├── client.model.ts        # Types CategorieClient, Interface Client, EligibiliteResponse
│   └── location.model.ts      # Interface Location, SimulationResponse, Statistiques
├── services/
│   ├── vehicule.service.ts    # Appels HTTP /api/vehicules
│   ├── client.service.ts      # Appels HTTP /api/clients
│   └── location.service.ts    # Appels HTTP /api/locations
├── components/
│   ├── navbar/                # Barre de navigation responsive
│   ├── dashboard/             # Indicateurs, KPIs et jauges du parc
│   ├── vehicules/
│   │   ├── vehicule-list/     # Catalogue avec grille de cartes et filtres
│   │   └── vehicule-form/     # Formulaire ajout / édition véhicule
│   ├── clients/
│   │   ├── client-list/       # Tableau clients avec badges et test éligibilité
│   │   ├── client-form/       # Formulaire ajout / édition client
│   │   └── client-detail/     # Fiche client et historique des locations
│   └── locations/
│       ├── location-list/     # Liste globale, actions départ / retour / annuler
│       ├── location-wizard/   # Stepper guidé (client -> période -> dispo -> devis)
│       └── location-retour/   # Saisie km, pénalités et facture imprimable
├── app.component.ts           # Composant racine
├── app.routes.ts              # Routage complet de l'application
└── app.config.ts              # Configuration Angular standalone & HttpClient
```

---

## 👤 Auteur

- **Karim Ben Romdhane**
- Licence Informatique et Multimédia – Projet Web Spring Boot & Angular 22
