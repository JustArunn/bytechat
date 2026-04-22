# ☁️ Cloud Deployment Guide (AWS, Azure, GCP)

This guide provides instructions for deploying **ByteChat** to any major cloud provider (AWS, Azure, Google Cloud) using a portable, Docker-based architecture.

## 🏗 Target Architecture

- **Compute**: Cloud VM (AWS EC2, Azure VM, GCP Compute Engine).
- **Database**: Managed SQL (AWS RDS, Azure SQL, GCP Cloud SQL) or Dockerized PostgreSQL.
- **Orchestration**: Docker Compose.
- **CI/CD**: GitHub Actions via SSH.

---

## 1. 🛠 Infrastructure Setup

Regardless of your cloud provider, you need a virtual machine with the following:
- **OS**: Ubuntu 22.04 LTS (recommended).
- **Specs**: t3.medium (AWS), Standard_B2s (Azure), or e2-medium (GCP).
- **Network**: Allow inbound traffic on ports `80` (HTTP), `443` (HTTPS), and `22` (SSH).

---

## 2. 📦 Environment Configuration

On your server, clone the repository and set up your production environment variables:

```bash
git clone https://github.com/JustArunn/bytechat.git
cd bytechat
cp .env.example .env.prod
```

Edit `.env.prod` with your production values (Database URL, JWT Secrets, etc.).

---

## 3. 🚀 Automated Deployment (CD)

The project includes a **Cloud Deployment** workflow that works across any provider.

### GitHub Secrets Setup
To enable automated deployment, add these secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):

1.  `DEPLOY_HOST`: The public IP or DNS of your server.
2.  `DEPLOY_USER`: The SSH username (e.g., `ubuntu`, `azureuser`).
3.  `DEPLOY_SSH_KEY`: Your private SSH key content.

Once configured, every push to `main` will automatically build and deploy the latest version to your cloud server.

---

## 4. 🔒 SSL & Reverse Proxy

We recommend using Nginx to handle SSL termination.

1. **Install Nginx**: `sudo apt install nginx -y`
2. **SSL with Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 🆘 Troubleshooting

- **Check Logs**: `docker-compose -f docker-compose.prod.yml logs -f`
- **Docker Permission**: Ensure your user is in the `docker` group: `sudo usermod -aG docker $USER`.

---

<p align="center">
  For more details on local development, see <a href="./README.md">README.md</a>.
</p>
