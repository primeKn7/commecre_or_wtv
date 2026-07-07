# 🅿️ AutoPark Manager

Plateforme de gestion de parking en ligne — VueJS 3 + Supabase.

## Fonctionnalités principales

- Galerie de places de parking avec filtres, recherche et pagination
- Réservation avec calcul automatique du montant
- Panier persistant avec code promo
- Paiement sandbox (simulation)
- Espace client (réservations, profil)
- Back-office admin complet (places, catégories, réservations, paiements, utilisateurs, messages)
- Authentification avec rôles `client` / `admin`
- Temps réel Supabase (disponibilité des places, nouvelles réservations)
- Row Level Security Supabase

## Stack

- **Vue 3** + Vite + Composition API
- **Vue Router** + guards de routes
- **Pinia** (authStore, parkingStore, cartStore, reservationStore, adminStore)
- **Tailwind CSS v4**
- **Supabase** (Auth, Database PostgreSQL, Storage, Realtime, RLS)

## Installation

```bash
git clone <repo>
cd autopark-manager
npm install
```

## Configuration `.env`

```bash
cp .env.example .env
```

Puis renseignez vos valeurs Supabase dans `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
VITE_PAYMENT_PROVIDER=simulation
```

## Base de données Supabase

1. Créez un projet sur https://supabase.com
2. Dans **SQL Editor**, collez et exécutez le contenu de `supabase-schema.sql`
3. Les tables, triggers, RLS et données initiales sont créés automatiquement

## Lancement

```bash
npm run dev
```

## Créer un compte admin

Après inscription sur `/register`, exécutez dans le SQL Editor Supabase :

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'votre@email.com';
```

## Structure du projet

```
src/
  assets/         Styles globaux (Tailwind)
  components/     Composants (layout, parking, admin)
  layouts/        PublicLayout, AuthLayout, AdminLayout
  pages/          Pages (public, auth, client, admin)
  router/         Routes + guards
  services/       supabaseClient, parkingService, reservationService, paymentService
  stores/         Pinia stores (auth, parking, cart, reservation, admin)
  utils/          formatCurrency, formatDate, calculateDuration, validators
```

## Routes

| Route | Accès |
|---|---|
| `/` | Public |
| `/parking`, `/parking/:slug` | Public |
| `/login`, `/register` | Non connecté |
| `/checkout`, `/profile`, `/my-reservations` | Connecté |
| `/admin/**` | Admin uniquement |

## Déploiement

```bash
npm run build
```

Le dossier `dist/` est prêt pour Vercel, Netlify ou tout hébergeur statique.
