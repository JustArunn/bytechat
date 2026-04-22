# ByteChat Production Deployment Guide

This guide outlines the steps to deploy ByteChat to a production environment (e.g., Ubuntu Server).

## 🏗️ Deployment Architecture

The application is containerized using Docker. Production orchestration is managed by `docker-compose.prod.yml`.

## 1. Prerequisites

- A Linux server (Ubuntu 22.04+ recommended)
- Docker & Docker Compose installed
- A domain name (optional, but recommended)

## 2. Server Configuration

1. **Clone the Repository**:

    ```bash
    git clone <your-repo-url>
    cd bytechat
    ```

2. **Environment Variables**:
    Copy the `.env.example` to `.env` on the server and fill in the production secrets:

    ```bash
    cp .env.example .env
    nano .env
    ```

    *Make sure to change `JWT_SECRET`, `SPRING_DATASOURCE_PASSWORD`, and `VITE_API_URL` (point it to your server's IP or domain).*

## 3. Automated Deployment (GitHub Actions)

The project includes GitHub Actions in `.github/workflows/` that automatically:

- Run unit tests on every PR.
- Build production Docker images on push to `main`.

## 4. Manual Deployment

If you want to deploy manually:

1. **Build Images**:

    ```bash
    ./scripts/build-images.sh
    ```

2. **Start Services**:

    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```

## 5. Reverse Proxy & SSL

It is highly recommended to use Nginx as a reverse proxy with Let's Encrypt (Certbot) for SSL.

- Frontend port: `3000`
- Backend port: `8080`
