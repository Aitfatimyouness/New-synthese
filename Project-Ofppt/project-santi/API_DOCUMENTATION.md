# API Documentation - OFPPT Formation

Base URL: `http://127.0.0.1:8000/api`

Authentication: `POST /login` returns a Sanctum bearer token. Send it as `Authorization: Bearer <token>`.

Seeded users all use password `password123`:

- `admin@ofppt.test`
- `cdc@ofppt.test`
- `formation@ofppt.test`
- `dr@ofppt.test`
- `participant@ofppt.test`
- `animateur@ofppt.test`

Main endpoints:

- `POST /login`, `GET /me`, `POST /logout`
- `GET /dashboard`
- `GET /analytics`
- `GET /reports/export.csv`
- `GET /options`
- CRUD: `/users`, `/themes`, `/centers`, `/formations`, `/sessions`, `/absences`, `/accommodations`, `/travels`, `/documents`, `/evaluations`, `/reports`
- Document download: `GET /documents/{id}/download`

Each CRUD endpoint supports:

- `GET /{resource}`
- `POST /{resource}`
- `GET /{resource}/{id}`
- `PUT/PATCH /{resource}/{id}`
- `DELETE /{resource}/{id}`

Roles:

- `admin`
- `responsable_cdc`
- `responsable_formation`
- `responsable_dr`
- `formateur_participant`
- `formateur_animateur`

Frontend default API URL is `http://127.0.0.1:8000/api`. Override with `REACT_APP_API_URL`.
