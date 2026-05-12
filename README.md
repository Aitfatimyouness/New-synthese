# Système de Gestion des Formations des Formateurs OFPPT

Plateforme Laravel API + React pour gerer les formations des formateurs OFPPT: formations, themes, planification, absences, logistique, documents, evaluations, rapports, utilisateurs, roles et permissions.

## Architecture

- `synthese-backend`: API Laravel 12, MySQL, tokens API hachés, middlewares de rôle et permission.
- `synthese-frontend`: React + Vite, interface responsive avec sidebar, dashboards par rôle, CRUD métier et export imprimable des rapports.
- Logo OFPPT configurable via `VITE_OFPPT_LOGO`; par defaut: `synthese-frontend/public/ofppt-logo.png`.

## Schema fonctionnel

Tables principales: `users`, `roles`, `permissions`, `role_user`, `permission_role`, `formations`, `themes`, `formation_user`, `formation_sessions`, `absences`, `documents`, `evaluations`, `sites_formation`, `salles`, `hebergements`, `deplacements`, `notifications`, `rapports`, `centres`.

Types de formation pris en charge:

- `Formation technique CDC`
- `Formation pédagogique SFP`

RBAC:

- Administrateur: maintenance systeme, securite, utilisateurs, roles, permissions, supervision et consultation globale. Il ne cree pas les formations, ne planifie pas les sessions, ne gere pas les absences, les themes, les documents pedagogiques ou les evaluations.
- Responsable CDC: propose et coordonne les plans, cree les formations proposees et gere les themes associes.
- Responsable formation: valide les formations, planifie les sessions, gere calendrier, sites, salles, hebergements et deplacements.
- Responsable DR: consultation seulement.
- Participant: voit ses formations, son planning, ses documents, sa progression et remplit ses evaluations.
- Animateur: gere les absences, ajoute les supports pedagogiques et suit les evaluations de ses formations.

## Installation backend

```bash
cd synthese-backend
composer install
cp .env.example .env
php artisan key:generate
```

Créer une base MySQL nommée `ofppt_formations`, puis vérifier dans `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ofppt_formations
DB_USERNAME=root
DB_PASSWORD=
```

Lancer les migrations et les données de démonstration:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

## Installation frontend

```bash
cd synthese-frontend
npm install
npm run dev
```

Par défaut, le frontend appelle `http://127.0.0.1:8000/api`. Pour changer l'URL:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Comptes de démonstration

Mot de passe commun: `password123`.

- `admin@ofppt.ma`: Administrateur système
- `cdc@ofppt.ma`: Responsable CDC
- `formation@ofppt.ma`: Responsable de formation
- `dr@ofppt.ma`: Responsable DR
- `participant@ofppt.ma`: Formateur participant
- `animateur@ofppt.ma`: Formateur animateur

## Guide utilisateur

1. Se connecter avec un profil de démonstration.
2. Utiliser le dashboard pour consulter les statistiques, alertes et sessions.
3. Naviguer via la sidebar selon les permissions du rôle connecté.
4. Créer ou modifier les données depuis les boutons `Nouveau`, `Modifier`, `Supprimer`.
5. Utiliser la recherche dans chaque module pour filtrer les tableaux.
6. Dans `Planning`, les sessions refusent les conflits de date pour un même site ou animateur.
7. Dans `Rapports`, utiliser `Export PDF` pour imprimer ou sauvegarder le rapport.
