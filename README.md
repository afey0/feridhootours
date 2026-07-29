# FeridhooTours — Laravel 11 + Livewire 3 + Neon PostgreSQL on Render.com

This repository contains the full **Laravel 11 + Livewire 3 + PostgreSQL** codebase for the FeridhooTours Ferry & Speedboat Booking Platform, pre-configured for instant deployment on **Render.com** backed by **Neon Serverless PostgreSQL**.

---

## Architecture Overview

- **Framework**: Laravel 11 + Livewire 3 (Reactive Server-Side Components)
- **Database**: Neon.tech Serverless PostgreSQL (`DATABASE_URL` with SSL mode `require`)
- **Hosting**: Render.com Web Service (PHP 8.3 + Apache Docker Container)
- **State & Sync**: Instant database persistence for bookings, schedules, vessels, jetties, user directory, email alerts, and audit log history tracking.

---

## 🚀 How to Deploy on Render.com with Neon PostgreSQL

### Step 1: Create a Neon PostgreSQL Database
1. Sign up or log into [Neon.tech](https://neon.tech).
2. Create a new PostgreSQL project named `feridhootours-db`.
3. Copy your **PostgreSQL Connection String** from the Neon dashboard (e.g., `postgres://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`).

### Step 2: Deploy to Render.com
1. Log into [Render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`renderneon`).
4. Set the following details:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Region**: `Singapore (ap-southeast-1)` or nearest region.
5. In **Environment Variables**, add:
   - `DATABASE_URL` = `<Your Neon PostgreSQL Connection String>`
   - `APP_ENV` = `production`
   - `APP_DEBUG` = `false`
   - `APP_KEY` = `base64:RenderGeneratedKey...` (Run `php artisan key:generate --show` to generate)
6. Click **Create Web Service**.

Render will build the Docker container with PHP 8.3 + `pdo_pgsql` enabled, run automated database migrations on your Neon database, and launch the platform!

---

## 🔐 Access Credentials

| User Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@smartferry.mv` | `superadmin123` | Full access: Delete Bookings, Audit Logs, Shell/DB SuperAdmin restrictions enforced |
| **Operator Admin** | `admin@smartferry.mv` | `admin123` | Manage Vessels, Routes, Verify/Reject Payments (with mandatory comment), Ports |
| **Travel Agency** | `bookings@mvtravel.com` | `agency123` | Discounted agency ticket bookings and group management |
| **Passenger** | `ahmed@example.com` | `password123` | Book tickets, 10-minute hold timer, upload payment slips, manage my bookings |

---

## ⏱️ 10-Minute Hold & Auto-Release Mechanism

- Passengers have **10 minutes** to upload a bank transfer slip after booking a seat.
- If 10 minutes expire without a payment slip upload, the booking is automatically set to `rejected` and seats are unlocked.
- If an Admin declines a payment slip, a **rejection comment is mandatory**, and seats are immediately unlocked.

---

## 🛠️ Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/afey0/renderneon.git
cd renderneon

# 2. Install dependencies
composer install

# 3. Copy environment file and set database connection
cp .env.example .env
php artisan key:generate

# 4. Run migrations and seeders
php artisan migrate --seed

# 5. Start local development server
php artisan serve
```
