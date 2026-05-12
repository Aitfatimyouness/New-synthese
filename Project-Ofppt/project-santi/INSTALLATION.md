# Installation Locale

## Backend Laravel

```bash
cd project-santi
composer install
cp .env.example .env
php artisan key:generate
```

Create a MySQL database named `ofppt_formations`, then update `.env` if your MySQL credentials differ.

```bash
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

The API runs at `http://127.0.0.1:8000/api`.

Seeded accounts all use `password123`:

- `admin@ofppt.test`
- `cdc@ofppt.test`
- `formation@ofppt.test`
- `dr@ofppt.test`
- `participant@ofppt.test`
- `animateur@ofppt.test`

## Frontend React

```bash
cd project-santi-frontend
npm install
npm start
```

The React app runs at `http://localhost:3000`.

If PowerShell blocks `npm.ps1`, use `npm.cmd install`, `npm.cmd start`, or `npm.cmd run build`.

## Verification Checklist

- Login with each seeded role.
- Open the dashboard and confirm stats load from API.
- Create, edit, delete records in formations, sessions, absences, centers, accommodations, travels, documents, evaluations, reports.
- Upload a document and download it from the documents table.
- Export reports CSV from the dashboard.
- Confirm participants see only their path, documents, evaluations, absences, logistics.
- Confirm animateurs can access assigned sessions and mark absences.
