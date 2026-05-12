# Project-Ofppt

Premium full-stack web application for **Systeme de Gestion des Formations des Formateurs de l'OFPPT**.

## Stack

- Backend: Laravel REST API
- Authentication: Laravel Sanctum token auth
- Database: MySQL
- Frontend: React.js
- Styling: custom premium SaaS dashboard UI with responsive light/dark mode

## Project Structure

- `project-santi/`: Laravel backend API, migrations, seeders, models, controllers, tests
- `project-santi-frontend/`: React frontend, Axios API integration, role dashboards, CRUD screens

## Database Setup

Create a MySQL database:

```bash
mysql -u root -p
CREATE DATABASE ofppt_formations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Copy Laravel environment variables:

```bash
cd project-santi
cp .env.example .env
```

Update `project-santi/.env` if needed:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ofppt_formations
DB_USERNAME=root
DB_PASSWORD=
```

## Backend Installation and Run

```bash
cd project-santi
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

Backend API URL:

```text
http://127.0.0.1:8000/api
```

## Frontend Installation and Run

```bash
cd project-santi-frontend
npm install
cp .env.example .env
npm start
```

Frontend URL:

```text
http://localhost:3000
```

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd install
npm.cmd start
```

## Migrations and Seeders

Run all migrations and seed realistic database test data:

```bash
cd project-santi
php artisan migrate:fresh --seed
```

Run tests:

```bash
php artisan test
cd ../project-santi-frontend
npm.cmd test -- --watchAll=false --runInBand
```

Build frontend:

```bash
cd project-santi-frontend
npm.cmd run build
```

## Test Accounts

All seeded accounts use password:

```text
password123
```

| Role | Email |
| --- | --- |
| Administrateur systeme | `admin@ofppt.test` |
| Responsable CDC | `cdc@ofppt.test` |
| Responsable de formation | `formation@ofppt.test` |
| Responsable DR | `dr@ofppt.test` |
| Formateur participant | `participant@ofppt.test` |
| Formateur animateur | `animateur@ofppt.test` |

## Main API Routes

- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/dashboard`
- `GET /api/analytics`
- `GET /api/options`
- `GET /api/reports/export.csv`
- `GET /api/documents/{document}/download`

CRUD resources:

- `users`
- `centers`
- `themes`
- `formations`
- `sessions`
- `absences`
- `accommodations`
- `travels`
- `documents`
- `evaluations`
- `reports`

Each CRUD resource supports:

```text
GET /api/{resource}
POST /api/{resource}
GET /api/{resource}/{id}
PUT/PATCH/POST /api/{resource}/{id}
DELETE /api/{resource}/{id}
```
