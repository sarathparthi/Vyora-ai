# Vyora Cloud & Production Deployment Guide

---

## 🚀 Deployment Targets

### Option 1: Docker Compose (Single Host / VPS)
Suitable for Railway, DigitalOcean Droplets, AWS EC2, or Linode.

```bash
# 1. Clone repository
git clone https://github.com/your-org/vyora.git
cd vyora

# 2. Configure Environment Variables
cp backend/.env.example backend/.env

# 3. Launch Stack
docker-compose up --build -d
```

---

### Option 2: Serverless / Cloud Native
- **Frontend**: Deploy `frontend/` to **Vercel** (`vercel --prod`).
- **Backend API**: Deploy `backend/` to **Render** or **Railway**.
- **Database**: Managed PostgreSQL on **Neon** or **AWS RDS**.
- **Redis**: Managed Redis on **Upstash**.
