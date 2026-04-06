# Railway Deployment Guide

This guide outlines how to deploy the API Rate Limiter project to **Railway** manually. This project structure works perfectly as a monorepo in Railway and requires zero code changes to deploy.

## Prerequisites
- A Railway account (https://railway.app/)
- Your code pushed to a GitHub repository

---

## 1. Provision a Database Service (Redis)

Before deploying the applications, we need an active Redis database to manage the sliding window rate limiter state.

1. Go to your new Railway Project.
2. Click **New** -> **Database** -> **Add Redis**.
3. Railway will provision a managed Redis container. Once ready, click on it and go to the **Variables** tab to view your `REDIS_URL`.

---

## 2. Deploy the Backend Service

1. From the same Railway Project, click **New** -> **GitHub Repo** and select your project repository.
2. Railway will automatically detect the source code, but we must configure it to isolate the `backend` folder.
3. Click the newly created service and go to its **Settings**:
   - **Root Directory**: Type `/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `npm run dev` if you prefer, but `npm start` is recommended for standard deployment)
4. Go to the **Variables** tab for the backend service and add the following:
   - `PORT`: `3001` (or whatever port you prefer)
   - `REDIS_URL`: Reference the Redis service *(You can either link to the Redis variable dynamically typing `${{Redis.REDIS_URL}}` or by manually pasting the connection string provided in Step 1).*
5. Go back to **Settings**, scroll down to **Networking**, and click **Generate Domain**.

---

## 3. Deploy the Frontend Dashboard 

1. From the Railway Project, again click **New** -> **GitHub Repo** and select your identical project repository. This will provision your second web service.
2. Go to its **Settings**:
   - **Root Directory**: Type `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview` *(or standard webserver command)*
3. Go to the **Variables** tab for the frontend and add the following:
   - `VITE_API_URL`: Paste the generated domain URL from the Backend (e.g. `https://your-backend.up.railway.app`). Ensure it has `https://` but no trailing slash `/`.
4. Go back to **Settings**, scroll down to **Networking**, and click **Generate Domain** so your React application points to a public domain.

---

## 4. Final Review
- At this point, your dashboard will be live at the frontend's Railway domain.
- The React application correctly routes its API and WebSocket calls dynamically to the Backend using `VITE_API_URL`.
- The Node/Express backend securely communicates to Redis using `REDIS_URL`.

---

> **Note on Local Development**: None of these Railway configurations impact local development. Re-running `docker-compose up --build` works perfectly and will automatically rely on the `docker-compose.yml` local orchestration without any manual URL edits.
