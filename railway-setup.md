# Railway Deployment Guide

This document describes how to deploy the API Rate Limiter Service on [Railway](https://railway.app).

---

## Architecture

| Service  | Root directory | Exposed port |
|----------|---------------|--------------|
| Backend  | `/backend`    | `3001`       |
| Frontend | `/frontend`   | `5173`       |
| Redis    | Managed DB    | —            |

---

## Step-by-step setup

### 1. Create a new Railway project

Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** and select this repository.

### 2. Add a Redis database

Inside the project, click **+ New** → **Database** → **Add Redis**.  
Railway will provision a managed Redis instance and expose a `REDIS_URL` variable automatically.

### 3. Configure the Backend service

In the **Backend** service settings:

- **Root directory:** `backend`
- **Build command:** `npm install` (Railway auto-detects this)
- **Start command:** `npm start`

Set the following **environment variables**:

| Variable       | Value                                              |
|----------------|----------------------------------------------------|
| `PORT`         | `3001`                                             |
| `REDIS_URL`    | *(link to the Redis service — Railway fills this automatically when you add the Redis plugin)* |
| `FRONTEND_URL` | `https://your-frontend.up.railway.app`             |

> **Tip:** Use Railway's *variable reference* feature to link `REDIS_URL` directly from the Redis service so it updates automatically if the credentials rotate.

### 4. Configure the Frontend service

In the **Frontend** service settings:

- **Root directory:** `frontend`
- **Build command:** `npm install && npm run build`
- **Start command:** `npx serve dist -l 5173` (or use a static-site deployment)

Set the following **environment variables**:

| Variable       | Value                                        |
|----------------|----------------------------------------------|
| `VITE_API_URL` | `https://your-backend.up.railway.app`        |

> **Important:** `VITE_API_URL` must be set **before** the build step runs because Vite bakes it into the static bundle at build time. Set it in Railway's environment variables panel, not at runtime.

### 5. Deploy

Trigger a deploy for both services. Railway will:
1. Build and start the Redis instance.
2. Build and start the backend (which connects to Redis via `REDIS_URL`).
3. Build the frontend bundle (with `VITE_API_URL` baked in) and serve it.

---

## Environment variable reference

### Backend (`/backend/.env.example`)

```
PORT=3001
REDIS_URL=redis://redis:6379          # replaced by Railway's managed URL in production
FRONTEND_URL=http://localhost:8080    # replaced by your Railway frontend URL in production
```

### Frontend (`/frontend/.env.example`)

```
VITE_API_URL=http://localhost:3001    # replaced by your Railway backend URL in production
```

---

## Local development (Docker Compose)

No manual configuration is required. Simply run:

```bash
docker compose up --build
```

The compose file pre-sets all variables for the local environment:

- `REDIS_URL=redis://redis:6379` — connects the backend to the Redis container by service name.
- `FRONTEND_URL=http://localhost:8080` — allows CORS from the Vite dev server.
- `VITE_API_URL=http://localhost:3001` — points the frontend at the local backend.

Open **[http://localhost:8080](http://localhost:8080)** once all containers are healthy.

---

## Redis connection fallback chain

The backend resolves the Redis connection in this order:

1. `REDIS_URL` environment variable — used by Railway and any environment that provides a full connection string.
2. `REDIS_HOST` + `REDIS_PORT` — legacy fallback for environments that set individual host/port variables.
3. `redis://redis:6379` — hard-coded default matching the Docker Compose service name.
