# MediFind — Docker & Container Setup Guide

This document describes how to run and manage the **MediFind** application locally or in container environments using **Docker** and **Docker Compose**.

---

## 📦 Architecture Components

| Container Name | Service | Technology Stack | Exposed Ports | Internal Port |
| :--- | :--- | :--- | :--- | :--- |
| `medifind-postgres` | Database | PostgreSQL 16 Alpine | `5432:5432` | `5432` |
| `medifind-backend` | Web API | .NET 8 ASP.NET Core | `5000:5000` | `5000` |
| `medifind-frontend` | Frontend SPA | React 18, Vite, Nginx Alpine | `80:80`, `3000:80` | `80` |

---

## 🚀 Quick Start with Docker Compose

### Prerequisites

- **Docker Desktop** (v20.10+) installed and running.
- **Docker Compose** (v2+) installed.

### 1. Start All Services

From the root project directory, run:

```bash
docker-compose up -d --build
```

Docker Compose will:
1. Pull `postgres:16-alpine` and initialize PostgreSQL container.
2. Wait for PostgreSQL healthcheck (`pg_isready`) to pass.
3. Build the .NET 8 backend container (`/backend/Dockerfile`), connect to PostgreSQL, perform database schema migrations, and seed sample data.
4. Build the React SPA container (`/Dockerfile`) using Node.js multi-stage build, serve via Nginx, and proxy `/api/*` to the backend API container.

---

### 2. Verify Running Services & Health

Check container status:

```bash
docker-compose ps
```

All three services should show `State: Up` or `healthy`:

```text
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS                    PORTS
medifind-backend    medifind-backend    "dotnet MedicineAvai…"   backend             10 seconds ago      Up 10 seconds (healthy)   0.0.0.0:5000->5000/tcp
medifind-frontend   medifind-frontend   "/docker-entrypoint.…"   frontend            10 seconds ago      Up 10 seconds             0.0.0.0:80->80/tcp, 0.0.0.0:3000->80/tcp
medifind-postgres   postgres:16-alpine  "docker-entrypoint.s…"   postgres            15 seconds ago      Up 15 seconds (healthy)   0.0.0.0:5432->5432/tcp
```

Test API Health Endpoint:

```bash
curl http://localhost:5000/health
```

Expected output:
```json
{"status":"Healthy","database":"Connected","timestamp":"2025-08-09T10:00:00Z"}
```

---

### 3. Accessing the Applications

- **Frontend Web Portal**: Open `http://localhost` or `http://localhost:3000` in your web browser.
- **Backend API Direct Endpoint**: `http://localhost:5000`
- **API Healthcheck**: `http://localhost:5000/health`
- **Swagger API Documentation** (when `ASPNETCORE_ENVIRONMENT=Development`): `http://localhost:5000/swagger`

---

### 4. Viewing Logs & Debugging

View logs for all services:
```bash
docker-compose logs -f
```

View logs for specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

### 5. Stopping and Resetting Services

Stop running containers:
```bash
docker-compose down
```

Stop containers and remove persistent database volumes (Clean reset):
```bash
docker-compose down -v
```

---

## 🛠️ Environment Configuration (.env)

Customize container environment variables in `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_secure_pass_2025
POSTGRES_DB=MedicineAvailabilityDb
JWT_SECRET_KEY=SuperSecretKeyForPharmacySystem2025SecureKeyNeverExposeInProduction!
JWT_ISSUER=MedicineAvailabilityApi
JWT_AUDIENCE=MedicineAvailabilityApp
```
