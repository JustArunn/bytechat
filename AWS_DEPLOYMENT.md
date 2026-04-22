# AWS EC2 Deployment Guide for ByteChat

This guide explains how to set up your AWS EC2 instance from scratch to host the ByteChat monorepo.

## 1. Launching the EC2 Instance
- **AMI**: Ubuntu 22.04 LTS (64-bit)
- **Instance Type**: `t3.medium` (Minimum 4GB RAM recommended for Java & React build processes)
- **Storage**: 20GB+ SSD

## 2. Security Group Configuration
Ensure your instance has a Security Group with these inbound rules:
| Protocol | Port | Source | Description |
| :--- | :--- | :--- | :--- |
| SSH | 22 | My IP | For terminal access |
| HTTP | 80 | 0.0.0.0/0 | For Frontend access |
| Custom TCP | 8080 | 0.0.0.0/0 | For Backend API access |

## 3. Server Initialization
Once connected via SSH, run the following commands to install the required runtime environment:

```bash
# 1. Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker and Docker Compose
sudo apt-get install -y docker.io docker-compose git

# 3. Enable Docker and set permissions
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# 4. Create the project directory
mkdir -p ~/bytechat

# IMPORTANT: Exit and reconnect to refresh user permissions
exit
```

## 4. Connecting GitHub Actions
To enable automated deployment, follow the **[GITHUB_SECRETS.md](./GITHUB_SECRETS.md)** guide to add your EC2 IP and SSH Key to your repository settings.

## 5. SSL & Domains (Recommended)
For production, you should use Nginx to handle HTTPS. 
1. Install Nginx: `sudo apt install nginx`
2. Point your domain A-record to the EC2 Elastic IP.
3. Use Certbot for free SSL: `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx`
