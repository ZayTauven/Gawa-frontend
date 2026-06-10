# Gawa — Frontend Web

Tableau de bord web du **système de gestion scolaire Gawa**, conçu pour les écoles des Comores : centré sur l'enseignant et pensé pour des connexions instables.

Application **Next.js 16 (App Router)** en **React 19** et **TypeScript**, stylée avec **Tailwind CSS v4**.

---

## Stack technique

| Composant         | Technologie                          |
|-------------------|--------------------------------------|
| Framework         | Next.js 16 (App Router)              |
| UI                | React 19, TypeScript 5               |
| Styles            | Tailwind CSS v4                      |
| État global       | Zustand                              |
| Données serveur   | TanStack Query (React Query)         |
| Client HTTP       | Axios                                |
| Auth              | JWT (`jwt-decode`)                   |
| Icônes            | `lucide-react`                       |
| Tests E2E         | Playwright                           |

---

## Structure du projet

```
app/                  # Routes (App Router)
  login/              # Authentification
  dashboard/
    admin/            # Espace administration
    teacher/          # Espace enseignant
    parent/           # Espace parent
    student/          # Espace élève
    platform/         # Espace plateforme (super-admin)
components/
  shell/              # Layout, navigation, structure
  ui/                 # Composants UI réutilisables
features/             # Logique métier par rôle (admin, teacher, parent, student, platform, auth)
lib/
  api/                # Client API et endpoints
  auth/               # Gestion des tokens et sessions
  utils/              # Utilitaires
public/               # Assets statiques
```

L'application s'appuie sur l'[API backend Gawa](https://github.com/ZayTauven/Gawa-Backend) (Django REST Framework + JWT).

---

## Démarrage

### Prérequis
- Node.js 20+
- Le [backend Gawa](https://github.com/ZayTauven/Gawa-Backend) en cours d'exécution (par défaut `http://localhost:8000`)

### Installation

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Configuration

Créez un fichier `.env.local` (non versionné) pour pointer vers l'API :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Scripts

| Commande         | Description                          |
|------------------|--------------------------------------|
| `npm run dev`    | Serveur de développement             |
| `npm run build`  | Build de production                  |
| `npm run start`  | Démarre le build de production       |
| `npm run lint`   | Vérification ESLint                  |

---

## Rôles & espaces

L'interface s'adapte au rôle de l'utilisateur authentifié (rôle porté par le JWT) :

- **Admin** — gestion de l'école, classes, utilisateurs.
- **Enseignant** — appel, cours, évaluations, communication.
- **Parent** — suivi de la scolarité de l'enfant.
- **Élève** — cours et progression.
- **Plateforme** — supervision multi-écoles.

---

## Projet Gawa

Ce frontend fait partie de l'écosystème Gawa :
- **Frontend web** (ce repo) — tableau de bord Next.js.
- **Backend** — API Django REST Framework.
- **Landing** — site vitrine Next.js.
