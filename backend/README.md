# Saarika API (PostgreSQL + auth)

Small **Express** service used by the Flutter app when you pass:

`--dart-define=API_BASE_URL=http://localhost:3333`

## 1. Start Postgres

From this folder:

```bash
docker compose up -d
```

## 2. Configure env

```bash
copy .env.example .env
```

Edit `.env` if needed (defaults match `docker-compose.yml`).

## 3. Install & migrate

```bash
npm install
npm run migrate
```

## 4. Run API

```bash
npm start
```

## 5. Run Flutter (same machine)

```bash
cd ..
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3333
```

**Android emulator** (API on host): use `http://10.0.2.2:3333` instead of `localhost`.

Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
