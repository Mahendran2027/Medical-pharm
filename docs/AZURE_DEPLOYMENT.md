# MediFind — Azure Production Deployment Guide

This guide describes how to deploy the **MediFind** real-time medicine availability and pharmacy reservation system to **Microsoft Azure** using enterprise best practices:
- **Azure Database for PostgreSQL (Flexible Server)** for durable relational data storage.
- **Azure Container Registry (ACR)** for hosting multi-stage container images.
- **Azure App Service (Linux Web App for Containers)** or **Azure Container Apps** for hosting the backend API and frontend Nginx SPA.
- **Azure Key Vault** for securely storing secrets, connection strings, and JWT keys.

---

## 🏗️ Architecture Overview

```text
               +-------------------------------------------+
               |             Client Web Browser            |
               +-------------------------------------------+
                                     |
                                  HTTPS 443
                                     v
               +-------------------------------------------+
               |      Azure App Service (Frontend SPA)     |
               |          Nginx + React Static Build       |
               +-------------------------------------------+
                                     |
                           /api/* Internal Proxy
                                     v
               +-------------------------------------------+
               |       Azure App Service (Backend API)     |
               |             ASP.NET Core 8 Web API        |
               +-------------------------------------------+
                                     |
                     Managed PostgreSQL Connection
                                     v
               +-------------------------------------------+
               |  Azure Database for PostgreSQL Flexible   |
               +-------------------------------------------+
```

---

## 📋 Prerequisites

1. **Azure CLI** installed and authenticated (`az login`).
2. An active **Azure Subscription** with permissions to create Resource Groups, PostgreSQL servers, App Services, and Key Vaults.
3. **Docker Desktop** or Docker CLI for building and pushing container images.

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Set Up Environment Variables & Resource Group

```bash
# Variables
RESOURCE_GROUP="rg-medifind-prod"
LOCATION="eastus"
ACR_NAME="acrmedifindprod"
POSTGRES_SERVER="pg-medifind-prod"
POSTGRES_DB="MedicineAvailabilityDb"
POSTGRES_USER="medifindadmin"
POSTGRES_PASS="SuperSecretDbPass2025!" # Use a strong password
KEYVAULT_NAME="kv-medifind-prod"
BACKEND_APP_NAME="app-medifind-backend-prod"
FRONTEND_APP_NAME="app-medifind-frontend-prod"

# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION
```

---

### Step 2: Provision Azure Database for PostgreSQL (Flexible Server)

```bash
# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --location $LOCATION \
  --admin-user $POSTGRES_USER \
  --admin-password $POSTGRES_PASS \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16

# Create Application Database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name $POSTGRES_DB

# Allow Azure Services access to the database
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $POSTGRES_SERVER \
  --rule-name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

### Step 3: Create Azure Container Registry (ACR) & Push Images

```bash
# Create Container Registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Log in to ACR
az acr login --name $ACR_NAME

# Build and Push Backend Container Image
docker build -t $ACR_NAME.azurecr.io/medifind-backend:v1 ./backend
docker push $ACR_NAME.azurecr.io/medifind-backend:v1

# Build and Push Frontend Container Image
docker build -t $ACR_NAME.azurecr.io/medifind-frontend:v1 .
docker push $ACR_NAME.azurecr.io/medifind-frontend:v1
```

---

### Step 4: Deploy Azure Key Vault for Secrets Management

```bash
# Create Key Vault
az keyvault create \
  --name $KEYVAULT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Store Database Connection String in Key Vault
POSTGRES_CONN_STR="Host=${POSTGRES_SERVER}.postgres.database.azure.com;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASS};Ssl Mode=Require;"

az keyvault secret set \
  --vault-name $KEYVAULT_NAME \
  --name "ConnectionStrings--DefaultConnection" \
  --value "$POSTGRES_CONN_STR"

# Store JWT Secret Key in Key Vault
az keyvault secret set \
  --vault-name $KEYVAULT_NAME \
  --name "Jwt--Key" \
  --value "AzureProductionSecureJWTKey2025MustBeAtLeast256BitsLongForHMACSHA256!"
```

---

### Step 5: Deploy Backend Web App Container

```bash
# Get ACR Credentials
ACR_PASS=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Create App Service Plan (Linux Container)
az appservice plan create \
  --name plan-medifind-prod \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B1

# Create Web App for Container (Backend API)
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan plan-medifind-prod \
  --name $BACKEND_APP_NAME \
  --deployment-container-image-name $ACR_NAME.azurecr.io/medifind-backend:v1

# Configure Container Registry Auth
az webapp config container set \
  --name $BACKEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name $ACR_NAME.azurecr.io/medifind-backend:v1 \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_NAME \
  --docker-registry-server-password $ACR_PASS

# Configure App Settings & Environment Variables
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_APP_NAME \
  --settings \
    WEBSITES_PORT=5000 \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__DefaultConnection="$POSTGRES_CONN_STR" \
    Jwt__Key="AzureProductionSecureJWTKey2025MustBeAtLeast256BitsLongForHMACSHA256!" \
    Jwt__Issuer="MedicineAvailabilityApi" \
    Jwt__Audience="MedicineAvailabilityApp" \
    CORS_ALLOWED_ORIGINS="https://${FRONTEND_APP_NAME}.azurewebsites.net"
```

---

### Step 6: Deploy Frontend Web App Container

```bash
# Create Web App for Container (Frontend)
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan plan-medifind-prod \
  --name $FRONTEND_APP_NAME \
  --deployment-container-image-name $ACR_NAME.azurecr.io/medifind-frontend:v1

# Configure Container Registry Auth
az webapp config container set \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name $ACR_NAME.azurecr.io/medifind-frontend:v1 \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_NAME \
  --docker-registry-server-password $ACR_PASS

# Configure Port
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_APP_NAME \
  --settings WEBSITES_PORT=80
```

---

## 🔒 Security & Best Practices Summary

1. **Secrets Isolation**: No production passwords or JWT keys are committed to Git repository or stored in image layers.
2. **PostgreSQL Security**: Azure Managed PostgreSQL Flexible Server is isolated with firewall rules and requires SSL/TLS.
3. **CORS Hardening**: CORS policy restricted strictly to `https://${FRONTEND_APP_NAME}.azurewebsites.net`.
4. **Auto-Database Initializer**: The ASP.NET Core backend automatically executes EF Core schema creation and seeds default data on boot.
5. **SSL Termination**: Azure App Service automatically handles TLS/SSL certificates for HTTPS encryption.
