# FeridhooTours — Production Docker Stack (Laravel 11 + Livewire 3 + PostgreSQL + Redis + Nginx)

FeridhooTours is a premium Maldives Inter-Island Ferry & Speedboat Booking Platform built with **Laravel 11, Livewire 3, PostgreSQL, Redis, and Nginx**.

---

## 🏗️ Production 5-Container Architecture

This repository is configured out-of-the-box for production deployment using **Docker Compose** with 5 isolated containers:

```
                          ┌───────────────────────────┐
                          │   Host / Web Browser      │
                          └─────────────┬─────────────┘
                                        │ Port 80 / 8080
                                        ▼
                          ┌───────────────────────────┐
                          │   1. Nginx (1.25-alpine)  │
                          └─────────────┬─────────────┘
                                        │ FastCGI (9000)
                                        ▼
┌─────────────────────────┐           ┌───────────────────────────┐
│   3. Queue Worker       │──────────►│   2. Laravel App (php-fpm)│
└────────────┬────────────┘           └─────────────┬─────────────┘
             │                                      │
             ├───────────────────┬──────────────────┘
             ▼                   ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│ 4. Redis 7 (alpine)     │  │ 5. PostgreSQL 16        │
│ (Cache, Session, Queue) │  │ (Database + Data Vol)   │
└─────────────────────────┘  └─────────────────────────┘
```

| Service | Container Name | Image / Build | Role |
| :--- | :--- | :--- | :--- |
| **Nginx** | `feridhoo_nginx` | `nginx:1.25-alpine` | Reverse proxy serving static assets & forwarding FastCGI requests |
| **Laravel App** | `feridhoo_app` | `php:8.3-fpm-alpine` | Reactive Livewire app, database migrations, and business logic |
| **Queue Worker** | `feridhoo_queue` | `php:8.3-fpm-alpine` | Background job processing via Redis |
| **Redis** | `feridhoo_redis` | `redis:7-alpine` | High-performance cache, session store, and queue broker |
| **PostgreSQL** | `feridhoo_postgres` | `postgres:16-alpine` | Relational database storage with persistent volume |

---

## 🚀 VirtualBox Deployment (Docker Compose)

### Prerequisites
- VirtualBox VM running Linux (Ubuntu / Debian / AlmaLinux).
- Docker and Docker Compose installed in the VM.

### Step 1: Clone Repository in VM
```bash
git clone https://github.com/afey0/feridhootours.git
cd feridhootours
```

### Step 2: Launch the 5-Container Stack
```bash
docker compose up -d --build
```

Docker Compose will automatically:
1. Spin up **PostgreSQL 16** & **Redis 7** containers with healthchecks.
2. Build the **PHP 8.3 FPM** image with `pdo_pgsql`, `redis`, `gd`, `bcmath`, and `opcache`.
3. Run automated database migrations and seed default data.
4. Launch the **Queue Worker** and **Nginx** reverse proxy on ports `80` and `8080`.

---

## 🌐 Accessing the Platform

- **Inside VirtualBox VM**: Open browser to `http://localhost` or `http://localhost:8080`
- **From Windows Host Machine**:
  - **Using Port Forwarding**: Set Host Port `8080` → Guest Port `8080` in VirtualBox VM Network settings. Then open `http://localhost:8080`.
  - **Using Bridged Network**: Open `http://<VM-IP-ADDRESS>` (find IP via `ip a`).

---

## 🔑 Demo Access Credentials

| User Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@smartferry.mv` | `superadmin123` | Full access: Delete Bookings, Audit Logs, System settings |
| **Operator Admin** | `admin@smartferry.mv` | `admin123` | Manage Vessels, Routes, Verify/Reject Bank Slips, Ports |
| **Travel Agency** | `bookings@mvtravel.com` | `agency123` | Agency bookings and discounted group transfers |
| **Passenger** | `ahmed@example.com` | `password123` | Seat selection, booking transfers, digital boarding pass |

---

## 🛠️ Management Commands

```bash
# View running container status
docker compose ps

# View live container logs
docker compose logs -f

# Run artisan commands inside the app container
docker compose exec laravel-app php artisan migrate:status

# Stop the stack
docker compose down

# Wipe database and reset stack
docker compose down -v && docker compose up -d --build
```

---

## ☁️ Optional Cloud Deployment (Render.com + Neon PostgreSQL)

The repository also supports cloud deployment on **Render.com** backed by **Neon Serverless PostgreSQL**:
- Set `DATABASE_URL` = Neon PostgreSQL connection string.
- Render uses `Dockerfile` with automated startup entrypoint.
