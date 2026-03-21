# IVOX Backend 🎵

Backend API pour l'application IVOX - Plateforme de partage et vente de contenu créatif (musique, animations, avatars).

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technologique](#stack-technologique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [API Endpoints](#api-endpoints)
- [Routes Admin](#routes-admin)
- [Tester ADMIN_API_KEY Sur Postman](#tester-admin_api_key-sur-postman)
- [Socket.IO Events](#socketio-events)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Structure du Projet](#structure-du-projet)

## 📱 Aperçu

IVOX Backend est une API REST avec support Socket.IO pour la gestion en temps réel des messages, de la présence utilisateur et des transactions de vente de contenu créatif.

**URL en Production**: https://backend-q1iu.onrender.com

## ✨ Fonctionnalités

- 🔐 **Authentification JWT** - Enregistrement et connexion sécurisés
- 💬 **Messagerie en Temps Réel** - Chat live avec Socket.IO
- 🎵 **Upload de Contenu** - Support pour musiques, animations et avatars
- 🛒 **Système d'Achat** - Achat et vente de contenu avec historique
- 📊 **Gestion de Présence** - Statut en ligne/hors ligne des utilisateurs
- ✍️ **Indicateurs de Saisie** - Affichage du statut de saisie en temps réel
- 📁 **Stockage Cloud** - Intégration Cloudinary pour les fichiers

## 🛠 Stack Technologique

- **Node.js** - Runtime JavaScript côté serveur
- **Express.js** - Framework web minimaliste
- **Socket.IO** - Communication bidirectionnelle temps réel
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT (jsonwebtoken)** - Authentification sécurisée
- **Multer** - Middleware de gestion d'uploads
- **Cloudinary** - Service de stockage cloud
- **bcryptjs** - Hachage sécurisé des mots de passe
- **Jest** - Framework de test
- **Nodemon** - Rechargement automatique en développement

## 📦 Installation

### Prérequis

- Node.js (v16+)
- npm ou yarn
- Compte MongoDB Atlas
- Compte Cloudinary

### Étapes

1. **Cloner le dépôt**
   ```bash
   git clone <votre-repo>
   cd APP2/backend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Créer le fichier `.env`**
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier backend avec les variables suivantes :

```env
# Port serveur
PORT=8000

# Base de données
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Authentification JWT
JWT_SECRET=votre-cle-secrete-tres-longue-et-complexe

# Clé admin serveur (routes sensibles)
ADMIN_API_KEY=votre-cle-admin-longue-et-secrete

# Cloudinary
CLOUDINARY_NAME=votre-cloudinary-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# Facebook (optionnel)
FACEBOOK_APP_ID=votre-facebook-app-id
FACEBOOK_APP_SECRET=votre-facebook-app-secret

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret

# Node Environment
NODE_ENV=development
```

### Configuration MongoDB Atlas

1. Créer un cluster sur MongoDB Atlas
2. Créer un utilisateur de base de données
3. Ajouter votre adresse IP à "Network Access" (permettre 0.0.0.0/0 pour le développement)
4. Copier l'URI de connexion dans `MONGO_URI`

### Configuration Cloudinary

1. S'inscire sur Cloudinary
2. Récupérer `Cloud Name`, `API Key` et `API Secret` depuis le dashboard
3. Ajouter dans le fichier `.env`

## 🚀 Démarrage

### Développement (avec rechargement automatique)

```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:8000`

### Production

```bash
npm start
```

## 📡 API Endpoints

### Authentification

#### Enregistrement
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Réponse (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011"
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Réponse (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Articles (Songs, Animations, Avatars)

#### Créer/Upload un article
```http
POST /api/shopItem/upload?itemType=song
Content-Type: multipart/form-data
x-admin-key: <ADMIN_API_KEY>

file: <fichier>
title: "Ma Chanson"
description: "Description de la chanson"
duration: 180
price: 5.99
categorie: "song_moderne"
```

**Réponse (200)**
```json
{
  "message": "Article uploadé avec succès",
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Ma Chanson",
    "assetUrl": "https://res.cloudinary.com/...",
    "price": 5.99,
    "itemType": "song",
    "categorie": "song_moderne"
  }
}
```

#### Récupérer les articles
```http
GET /api/shopItem?itemType=song
```

**Réponse (200)**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Ma Chanson",
    "description": "...",
    "assetUrl": "https://res.cloudinary.com/...",
    "price": 5.99,
    "buyCount": 2,
    "categorie": "song_moderne"
  }
]
```

#### Acheter un article
```http
POST /api/shopItem/:itemId/buy
Authorization: Bearer <token>
```

**Réponse (200)**
```json
{
  "message": "Achat effectué avec succès"
}
```

## 🔐 Routes Admin

Ces routes sont protégées par une clé admin serveur, transmise dans le header `x-admin-key`.

### Header requis

```http
x-admin-key: <ADMIN_API_KEY>
```

### Routes admin disponibles

- `GET /api/users/`
- `GET /api/users/:id`
- `PATCH /api/users/:id/coins`
- `PATCH /api/users/:id/updateRole`
- `POST /api/shopItem/upload?itemType=song|animation|avatar`
- `DELETE /api/shopItem/:id`

### Routes non-admin (utilisateur connecté JWT)

- `POST /api/shopItem/:id/buy`

## 🧪 Tester ADMIN_API_KEY sur Postman

### 1. Ajouter la variable sur Render

Dans Render > service backend > Environment:

- `ADMIN_API_KEY` = une valeur longue et secrète

Puis redeploy.

### 2. Configurer Postman

Dans votre requête admin:

- Onglet `Headers`
- Ajouter `x-admin-key` avec la valeur exacte de `ADMIN_API_KEY`

Exemple pour modifier les pièces:

```http
PATCH /api/users/:id/coins
Content-Type: application/json
x-admin-key: <ADMIN_API_KEY>

{
  "coins": 120
}
```

### 3. Résultats attendus

- `200` : accès admin OK
- `403` : clé absente ou invalide
- `500` : variable `ADMIN_API_KEY` non configurée côté serveur

### 4. Test rapide conseillé

1. Faire un `GET /api/users/` sans `x-admin-key` (doit renvoyer `403`).
2. Refaire la même requête avec `x-admin-key` valide (doit renvoyer `200`).
3. Tester `PATCH /api/users/:id/coins` avec une valeur négative (doit renvoyer `400`).

## 🔌 Socket.IO Events

Connectez-vous au serveur WebSocket sur la même URL que l'API REST.

### Client → Serveur

#### `user_join`
Indique au serveur qu'un utilisateur est connecté
```javascript
socket.emit('user_join', {
  userId: '507f1f77bcf86cd799439011'
});
```

#### `chat_join`
Rejoindre une conversation avec un autre utilisateur
```javascript
socket.emit('chat_join', {
  userId: '507f1f77bcf86cd799439011',
  otherUserId: '507f1f77bcf86cd799439012'
});
```

#### `chat_history`
Récupérer l'historique des messages
```javascript
socket.emit('chat_history', {
  userId: '507f1f77bcf86cd799439011',
  otherUserId: '507f1f77bcf86cd799439012'
});
```

#### `message_send`
Envoyer un message
```javascript
socket.emit('message_send', {
  senderId: '507f1f77bcf86cd799439011',
  recipientId: '507f1f77bcf86cd799439012',
  content: 'Salut! Comment vas-tu?'
});
```

#### `message_read`
Marquer les messages comme lus
```javascript
socket.emit('message_read', {
  userId: '507f1f77bcf86cd799439011',
  otherUserId: '507f1f77bcf86cd799439012'
});
```

#### `typing_start`
Indiquer que l'utilisateur tape un message
```javascript
socket.emit('typing_start', {
  senderId: '507f1f77bcf86cd799439011',
  recipientId: '507f1f77bcf86cd799439012'
});
```

#### `typing_stop`
Indiquer que l'utilisateur a arrêté de taper
```javascript
socket.emit('typing_stop', {
  senderId: '507f1f77bcf86cd799439011',
  recipientId: '507f1f77bcf86cd799439012'
});
```

### Serveur → Client

#### `user_online`
Notification de présence utilisateur
```javascript
socket.on('user_online', (data) => {
  console.log('Utilisateur connecté:', data.userId);
});
```

#### `message_new`
Réception d'un nouveau message
```javascript
socket.on('message_new', (message) => {
  console.log('Message reçu:', message.content);
});
```

#### `message_sent`
Confirmation d'envoi d'un message
```javascript
socket.on('message_sent', (message) => {
  console.log('Message envoyé avec ID:', message._id);
});
```

#### `message_read_receipt`
Confirmation de lecture d'un message
```javascript
socket.on('message_read_receipt', () => {
  console.log('Message marqué comme lu');
});
```

#### `typing_indicator`
Indicateur de saisie
```javascript
socket.on('typing_indicator', (data) => {
  if (data.isTyping) {
    console.log('L\'utilisateur tape un message...');
  } else {
    console.log('L\'utilisateur a arrêté de taper');
  }
});
```

#### `chat_history_received`
Historique des messages reçu
```javascript
socket.on('chat_history_received', (messages) => {
  console.log('Messages reçus:', messages);
  messages.forEach(msg => console.log(msg.content));
});
```

## 🧪 Tests

### Exécuter tous les tests
```bash
npm test
```

### Exécuter les tests en mode watch
```bash
npm test -- --watch
```

### Exécuter un fichier de test spécifique
```bash
npm test -- itemRoutes.test.js
```

### Exécuter avec couverture
```bash
npm test -- --coverage
```

**Résultats actuels**: 120 tests réussis ✅

### Fichiers de test
- `tests/allRoutes.test.js` - Tests des routes principales
- `tests/buyApi.test.js` - Tests d'achat
- `tests/itemRoutes.test.js` - Tests des endpoints d'articles
- `tests/uploadShopItem.success.test.js` - Tests d'upload
- `tests/buyItemController.test.js` - Tests du contrôleur d'achat
- `tests/socketTwoUsers.integration.test.js` - Tests Socket.IO avec 2 utilisateurs

## 🌍 Déploiement

### Sur Render.com

1. **Créer un compte Render**
   - Accédez à https://render.com
   - Connectez-vous ou créez un compte

2. **Créer un nouveau Web Service**
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre dépôt GitHub
   - Sélectionnez le dépôt et la branche

3. **Configurer les paramètres**
   - **Name**: ivox-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (ou payant selon les besoins)

4. **Ajouter les variables d'environnement**
   - Allez à "Environment"
   - Ajoutez toutes les variables du fichier `.env`

5. **Deployer**
   - Cliquez sur "Create Web Service"
   - Render construira et déploiera automatiquement
   - Votre URL sera: `https://<app-name>.onrender.com`

### Notes importantes

- Les services gratuit Render s'arrêtent après 15 minutes d'inactivité
- Pour un service stable, utilisez une instance payante
- Installez les dépendances manquantes dans Render si nécessaire
- Vérifiez les logs en cas d'erreur

## 📁 Structure du Projet

```
backend/
├── config/              # Configurations (BD, Cloudinary, etc.)
│   ├── cloudinary.js   # Setup Cloudinary
│   ├── db.js           # Connexion MongoDB
│   └── passport.js     # Authentification OAuth
├── controllers/         # Logique métier
│   ├── authController.js
│   ├── ItemController.js
│   ├── messageController.js
│   └── VideoController.js
├── middlewares/         # Middlewares Express
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   ├── creatorMiddleware.js
│   ├── itemMiddleware.js
│   └── uploadVideoMiddleware.js
├── models/             # Schémas Mongoose
│   ├── user.js
│   ├── song.js
│   ├── animation.js
│   ├── avatarItem.js
│   ├── message.js
│   ├── quizz.js
│   └── video.js
├── routes/             # Définition des routes
│   ├── authRoutes.js
│   ├── itemRoutes.js
│   ├── userRoutes.js
│   └── videoRoutes.js
├── services/           # Services métier
│   ├── authService.js
│   └── chatService.js
├── sockets/            # Gestion Socket.IO
│   └── registerSocketHandlers.js
├── tests/              # Tests Jest
├── utils/              # Fonctions utilitaires
│   ├── chatHelper.js
│   └── generateToken.js
├── server.js           # Point d'entrée du serveur
├── package.json        # Dépendances et scripts
└── jest.config.json    # Configuration Jest
```

## 🔑 Variables d'Environnement Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `8000` |
| `MONGO_URI` | URI de connexion MongoDB | `mongodb+srv://user:pass@...` |
| `JWT_SECRET` | Clé secrète JWT | `votre-clé-très-secrète` |
| `ADMIN_API_KEY` | Clé admin serveur (header x-admin-key) | `votre-cle-admin-longue` |
| `CLOUDINARY_NAME` | Nom Cloudinary | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary | `api-key` |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | `api-secret` |
| `NODE_ENV` | Environnement | `development` ou `production` |

## 🐛 Dépannage

### Erreur "Base de donnees indisponible"
- Vérifiez votre `MONGO_URI`
- Vérifiez que votre adresse IP est whitelistée dans MongoDB Atlas
- Vérifiez la connexion Internet

### Erreur "Format de fichier non supporté"
- Vérifiez que le fichier uploadé est dans un format accepté
- Pour les musiques: `.mp3`, `.wav`, `.ogg`, `.aac`
- Pour les animations: `.json`, `.gif`, `.mp4`, `.webm`
- Pour les avatars: `.jpg`, `.png`, `.webp`

### Socket.IO ne se connecte pas
- Vérifiez que le serveur est en cours d'exécution
- Vérifiez que vous utilisez la bonne URL
- Vérifiez les logs de la console serveur

### Erreur JWT
- Vérifiez que le token est envoyé dans l'en-tête `Authorization: Bearer <token>`
- Vérifiez que le token n'a pas expiré (10 jours)
- Vérifiez que `JWT_SECRET` est correctement défini

### Erreur admin `403 Acces admin refuse`
- Vérifiez le header `x-admin-key` dans Postman
- Vérifiez que la valeur du header correspond exactement à `ADMIN_API_KEY`
- Vérifiez que `ADMIN_API_KEY` est bien défini dans Render (puis redeploy)

## 📝 License

Ce projet est fourni à titre d'exemple académique.

## 👨‍💻 Support

Pour toute question ou problème, veuillez créer une issue sur GitHub.

---

**Développé avec ❤️ pour IVOX**
