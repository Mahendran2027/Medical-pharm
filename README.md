# MediFind — Real-Time Medicine Availability & Pharmacy Reservation System

**MediFind** is an enterprise-grade full-stack platform designed to help customers find medicines across real-time local pharmacy inventories, reserve stock, and enable pharmacies and platform administrators to manage inventory, approvals, and analytics.

---

## 🌟 Key Features & User Roles

### 1. 🔍 Customer Portal
- **Medicine Search & Availability**: Interactive search with category filters, dosage matching, real-time stock statuses, and distance/location sorting.
- **Reservations**: Reserve medicines at local pharmacies with automatic code generation, status tracking, and expiration handling.
- **Interactive Maps & Location**: View local pharmacy locations with Google Maps integration and distance metrics.
- **Notifications**: Real-time alerts for reservation status updates (Approved, Ready for Pickup, Completed, Cancelled).

### 2. 🏥 Pharmacy Portal
- **Inventory Management**: Add, update stock levels, set prices, and manage medicine availability in real-time.
- **Reservation Workflow**: Review customer reservation requests, approve stock allocations, mark orders ready for pickup, or complete fulfillment.
- **Pharmacy Dashboard & Analytics**: Stock alerts, reservation metrics, and daily overview.

### 3. 🛡️ Admin Portal
- **Pharmacy Approvals**: Review pending pharmacy registration requests and approve/reject applications.
- **System User Management**: Manage system users, role assignments, and customer/pharmacy accounts.
- **Medicine Catalog & Categories**: Centralized master medicine catalog management and category taxonomy.
- **Platform Analytics**: Executive dashboard detailing platform reservation volume, active pharmacies, top-searched medicines, and system health.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Axios.
- **Backend API**: ASP.NET Core 8 Web API, Entity Framework Core, JWT Bearer Authentication, Swagger/OpenAPI.
- **Database**: PostgreSQL 16.
- **Containerization & Web Server**: Docker, Multi-Stage Dockerfiles, Nginx Alpine, Docker Compose.
- **Cloud Infrastructure**: Microsoft Azure (Azure App Service, Azure Database for PostgreSQL Flexible Server, Azure Key Vault, Azure Container Registry).

---

## 🚀 Quick Start (Local Docker Development)

```bash
# 1. Clone Repository
git clone <repository-url>
cd medifind

# 2. Launch All Containers
docker-compose up -d --build

# 3. Access Application
# Web Frontend: http://localhost or http://localhost:3000
# Backend API: http://localhost:5000
# Health Check: http://localhost:5000/health
```

---

## 📚 Documentation

- [Docker Setup Guide](docs/DOCKER.md) — Multi-container local orchestration & environment management.
- [Azure Deployment Guide](docs/AZURE_DEPLOYMENT.md) — Production architecture, Managed PostgreSQL, Key Vault, and ACR configuration.

---

## 🔒 Security & Quality Assurance

- **Role-Based Authorization**: Strict backend claim verification (`Customer`, `Pharmacy`, `Admin`).
- **Secrets Management**: Configuration via environment variables (`.env.example`), avoiding hardcoded credentials.
- **Health Checks**: Standardized `/health` endpoint validating PostgreSQL connectivity and runtime state.
