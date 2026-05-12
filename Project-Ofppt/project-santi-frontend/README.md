# OFPPT Formation Suite Frontend

Premium React dashboard for "Systeme de Gestion des Formations des Formateurs de l'OFPPT".

## Stack

- React
- React Router
- Axios API services
- Bootstrap base utilities with custom premium CSS
- Responsive SaaS dashboard UI with light/dark mode

## Run Locally

Start the Laravel API first:

```bash
cd ../project-santi
php artisan serve
```

Then run the frontend:

```bash
cd ../project-santi-frontend
npm install
npm start
```

Frontend URL: `http://localhost:3000`

Default API URL: `http://127.0.0.1:8000/api`

To override it:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

## Features

- Login/logout with Laravel Sanctum token API
- Protected application shell
- Role-based sidebar and dashboards
- Real dashboard statistics and analytics fetched from the database
- CRUD screens for users, themes, centers, formations, sessions, absences, logistics, documents, evaluations, and reports
- Document upload/download through Laravel storage
- Search, sorting, pagination, status highlights
- Success/error/loading notifications
- Responsive desktop/tablet/mobile layout
- Light/dark theme toggle

## Build Check

```bash
npm run build
```

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd run build
```
