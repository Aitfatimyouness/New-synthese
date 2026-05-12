# Systeme de Gestion des Formations des Formateurs de l'OFPPT

Backend Laravel REST API for the OFPPT trainer training management platform. The React frontend lives in `../project-santi-frontend`.

## Stack

- Laravel 12 REST API
- Laravel Sanctum token authentication
- MySQL in production/local setup, SQLite-friendly tests
- File storage through Laravel `public` disk

## Main Modules

- Authentication: login, logout, protected API, role-aware data scopes
- Formations: themes, formations, sessions, animator assignment, participant assignment, progression
- Absences: animator marking, history, alerts, statistics
- Logistics: sites/centers, hebergements, deplacements
- Documents: upload, archive flag, role visibility, download
- Evaluations: ratings, feedback, skills acquired, expected impact
- Reports: analytics payloads and CSV export

## Database Tables

The migrations create: `users`, `roles`, `personal_access_tokens`, `centers`, `themes`, `formations`, `formation_sessions`, `session_participants`, `absences`, `accommodations`, `travels`, `documents`, `evaluations`, and `reports`.

## Local Installation

```bash
cd project-santi
composer install
cp .env.example .env
php artisan key:generate
```

Create a MySQL database named `ofppt_formations`, then configure `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ofppt_formations
DB_USERNAME=root
DB_PASSWORD=
```

Run the schema, seed realistic test data, and expose document uploads:

```bash
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

API base URL: `http://127.0.0.1:8000/api`

## Seeded Accounts

All accounts use password `password123`.

| Role | Email |
| --- | --- |
| Administrateur systeme | `admin@ofppt.test` |
| Responsable CDC | `cdc@ofppt.test` |
| Responsable de formation | `formation@ofppt.test` |
| Responsable DR | `dr@ofppt.test` |
| Formateur participant | `participant@ofppt.test` |
| Formateur animateur | `animateur@ofppt.test` |

## API Routes

Public:

- `POST /api/login`

Authenticated with `Authorization: Bearer <token>`:

- `GET /api/me`
- `POST /api/logout`
- `GET /api/dashboard`
- `GET /api/analytics`
- `GET /api/reports/export.csv`
- `GET /api/options`
- `GET /api/documents/{document}/download`

CRUD resources:

- `GET /api/{resource}`
- `POST /api/{resource}`
- `GET /api/{resource}/{id}`
- `PUT|PATCH|POST /api/{resource}/{id}`
- `DELETE /api/{resource}/{id}`

Supported resources: `users`, `centers`, `themes`, `formations`, `sessions`, `absences`, `accommodations`, `travels`, `documents`, `evaluations`, `reports`.

## Verification

```bash
php artisan test
```

The included feature test verifies login, dashboard, options, CRUD paths, session participants, absence creation, evaluation creation, document upload/download, report creation/export, and participant-scoped access.
