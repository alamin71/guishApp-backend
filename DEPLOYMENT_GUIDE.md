# GuishApp Backend - AWS EC2 Deployment Guide

## 📋 Overview

Complete deployment guide for GuishApp backend Node.js application on AWS EC2 with Nginx, PM2, SSL, and custom domain.

---

## 🚀 Deployment Summary

- **Server:** AWS EC2 Ubuntu 24.04.3 LTS
- **Elastic IP:** 52.71.51.206
- **Domain:** api.guishapp.com
- **SSL:** Let's Encrypt (HTTPS enabled)
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **Runtime:** Node.js v20.x

---

## 📝 Step-by-Step Deployment Process

### 1. AWS EC2 Instance Setup

#### 1.1 Launch EC2 Instance

- Go to AWS Console → EC2 → Launch Instance
- **AMI:** Ubuntu Server 24.04 LTS
- **Instance Type:** t2.micro (or higher)
- **Key Pair:** Create/download `.pem` file (guishapp-backend.pem)
- **Security Group:** Configure inbound rules

#### 1.2 Configure Security Group

Add the following inbound rules:

| Type       | Protocol | Port | Source    |
| ---------- | -------- | ---- | --------- |
| SSH        | TCP      | 22   | 0.0.0.0/0 |
| HTTP       | TCP      | 80   | 0.0.0.0/0 |
| HTTPS      | TCP      | 443  | 0.0.0.0/0 |
| Custom TCP | TCP      | 5000 | 0.0.0.0/0 |

#### 1.3 Allocate Elastic IP

- EC2 Dashboard → Elastic IPs → Allocate Elastic IP address
- Associate with your instance
- **Elastic IP:** 52.71.51.206

---

### 2. SSH Connection

#### 2.1 Set Key Permissions (Windows)

```powershell
# Navigate to Downloads folder
cd C:\Users\alami\Downloads

# Connect via SSH
ssh -i "guishapp-backend.pem" ubuntu@52.71.51.206
```

#### 2.2 For Future Connections

```powershell
ssh -i "C:\Users\alami\Downloads\guishapp-backend.pem" ubuntu@52.71.51.206
```

---

### 3. Server Setup

#### 3.1 Update System

```bash
sudo apt update
```

#### 3.2 Install Node.js (v20.x LTS)

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3.3 Install Git

```bash
sudo apt install git -y
```

---

### 4. Deploy Application Code

#### 4.1 Create Project Directory

```bash
mkdir -p ~/apps
cd ~/apps
```

#### 4.2 Clone Repository

```bash
git clone https://github.com/alamin71/guishApp-backend.git
cd guishApp-backend
```

#### 4.3 Install Dependencies

```bash
npm install
```

#### 4.4 Create .env File

```bash
nano .env
```

Paste your environment variables and save:

- `Ctrl+O` → Enter (save)
- `Ctrl+X` (exit)

#### 4.5 Build Application

```bash
npm run build
```

---

### 5. Process Manager (PM2)

#### 5.1 Install PM2 Globally

```bash
sudo npm install -g pm2
```

#### 5.2 Start Application

```bash
pm2 start dist/server.js --name guishapp-backend
```

#### 5.3 Configure Auto-Startup

```bash
# Generate startup script
pm2 startup

# Copy and run the command shown (with sudo)
# Example: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save PM2 process list
pm2 save
```

#### 5.4 Useful PM2 Commands

```bash
pm2 status                    # Check status
pm2 logs                      # View logs
pm2 restart guishapp-backend  # Restart app
pm2 stop guishapp-backend     # Stop app
pm2 delete guishapp-backend   # Remove app
```

---

### 6. Nginx Setup

#### 6.1 Install Nginx

```bash
sudo apt install nginx -y
```

#### 6.2 Start and Enable Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 6.3 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/api.guishapp.com
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.guishapp.com www.api.guishapp.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and exit.

#### 6.4 Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/api.guishapp.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 6.5 Remove Conflicting Configs (if any)

```bash
sudo rm /etc/nginx/sites-enabled/guishapp.com
sudo systemctl reload nginx
```

---

### 7. DNS Configuration

#### 7.1 Client Action (Bluehost)

Client needs to add A Record in Bluehost DNS:

1. Login to Bluehost Dashboard
2. Domain Management → GUISHAPP.COM → Manage DNS
3. Add A Record:
   - **Host:** `api`
   - **Type:** `A Record`
   - **Points to:** `52.71.51.206`
   - **TTL:** `3600`
4. Save

**Result:** `api.guishapp.com` → Points to EC2 server

**Propagation Time:** 5-30 minutes (up to 48 hours)

---

### 8. SSL Certificate (HTTPS)

#### 8.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 8.2 Generate SSL Certificate

```bash
sudo certbot --nginx -d api.guishapp.com
```

**Prompts:**

1. **Email:** Enter your email
2. **Terms:** `Y` (Agree)
3. **Share email with EFF:** `N` (Optional)
4. **Redirect HTTP to HTTPS:** `2` (Redirect)

#### 8.3 Verify SSL

- Browser: `https://api.guishapp.com`
- Should show green padlock 🔒

#### 8.4 Auto-Renewal

Certbot automatically sets up renewal. Check timer:

```bash
systemctl list-timers | grep certbot
```

---

## 🔄 Update Deployment (Future Code Changes)

When you push code changes to GitHub:

```bash
# 1. SSH to EC2
ssh -i "C:\Users\alami\Downloads\guishapp-backend.pem" ubuntu@52.71.51.206

# 2. Navigate to project
cd ~/apps/guishApp-backend

# 3. Pull latest code
git pull origin main

# 4. Install new dependencies (if any)
npm install

# 5. Rebuild
npm run build

# 6. Restart PM2
pm2 restart guishapp-backend

# 7. Check logs
pm2 logs --lines 20
```

---

## 🛠️ Troubleshooting

### Check Application Status

```bash
pm2 status
pm2 logs guishapp-backend --lines 50
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check SSL Certificate

```bash
sudo certbot certificates
```

### View Nginx Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

### Renew SSL Manually (if needed)

```bash
sudo certbot renew --dry-run
```

---

## 📊 Server Access Information

### URLs

- **HTTP:** http://52.71.51.206:5000 (Direct)
- **Domain (HTTP):** http://api.guishapp.com
- **Domain (HTTPS):** https://api.guishapp.com ✅

### SSH Access

```bash
ssh -i "C:\Users\alami\Downloads\guishapp-backend.pem" ubuntu@52.71.51.206
```

### Server Details

- **OS:** Ubuntu 24.04.3 LTS
- **IP:** 52.71.51.206 (Elastic)
- **Region:** us-east-1
- **Node.js:** v20.x.x
- **npm:** 10.8.2

---

## 📁 File Structure on Server

```
/home/ubuntu/
└── apps/
    └── guishApp-backend/
        ├── dist/               # Compiled JavaScript
        ├── src/                # TypeScript source
        ├── node_modules/       # Dependencies
        ├── .env               # Environment variables
        ├── package.json
        └── tsconfig.json
```

---

## ⚙️ Environment Variables

Stored in `/home/ubuntu/apps/guishApp-backend/.env`

Key variables:

- `NODE_ENV=production`
- `PORT=5000`
- `SOCKET_PORT=9005`
- `database_url=mongodb+srv://...`
- `JWT_ACCESS_SECRET`
- `STRIPE_SECRET`
- `AWS_BUCKET_NAME`

---

## 🔐 Security Checklist

- ✅ Elastic IP allocated (static IP)
- ✅ SSH key-based authentication
- ✅ Security Group properly configured
- ✅ Nginx reverse proxy
- ✅ SSL/TLS certificate (Let's Encrypt)
- ✅ PM2 process manager
- ✅ Auto-restart on server reboot
- ✅ Environment variables secured

---

## 📞 Support & Maintenance

### Update SSL Email

```bash
sudo certbot update_account --email new-email@example.com
```

### Monitor Server Resources

```bash
htop
df -h
free -m
```

### Backup .env File

Always keep a backup of your `.env` file locally!

---

## ✅ Deployment Completed

**Date:** January 5, 2026  
**Status:** Live and Running  
**URL:** https://api.guishapp.com 🚀

---

**Note:** This deployment uses free tier eligible resources. Monitor your AWS usage to avoid unexpected charges.
