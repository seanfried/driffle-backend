# Guide de Démarrage Local - Driffle Marketplace

## État Actuel
✅ Dépendances installées (Serveur et Client)
✅ Fichiers de configuration `.env` créés
✅ Script d'initialisation de données (`seed.js`) prêt

## 🛑 Problème Détecté
Impossible de se connecter à MongoDB sur `localhost:27017`.
**Vous devez avoir une base de données MongoDB active.**

## 🚀 Comment résoudre et lancer le projet

### Option A : Vous avez MongoDB installé localement
1. Lancez votre serveur MongoDB (ex: via MongoDB Compass ou terminal).
2. Une fois lancé, exécutez le script de seed pour créer les comptes admin :
   ```bash
   node server/seed.js
   ```

### Option B : Utiliser MongoDB Atlas (Cloud Gratuit) - RECOMMANDÉ
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Créez un Cluster gratuit (M0).
3. Dans "Database Access", créez un utilisateur (ex: `admin` / `password123`).
4. Dans "Network Access", autorisez l'IP `0.0.0.0/0` (pour tester de partout).
5. Cliquez sur "Connect" > "Connect your application" et copiez l'URI.
6. Modifiez le fichier `.env` à la racine du projet :
   ```
   MONGODB_URI=votre_uri_copiee_ici
   ```
   *(Remplacez `<password>` par votre mot de passe réel)*
7. Exécutez le script de seed :
   ```bash
   node server/seed.js
   ```

### 🏁 Lancer l'application
Une fois la base de données connectée et "seedée" :

1. Ouvrez un terminal à la racine du projet `geekchic`.
2. Lancez le serveur et le client en parallèle :
   ```bash
   npm run dev
   ```
3. Accédez à :
   - Site public : http://localhost:3000
   - Admin : http://localhost:3000/admin

### 🔑 Comptes de Test (créés par le script seed)
- **Admin** : `admin@example.com` / `password123`
- **User** : `user@example.com` / `password123`