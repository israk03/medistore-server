# MediStore Server 💊

> A scalable, production-ready REST API for an online OTC medicine marketplace.

---

## 📌 Overview

**MediStore Server** powers a full-stack e-commerce platform where:

- Customers can browse, purchase, and review medicines
- Sellers can manage inventory and fulfill orders
- Admins can oversee the entire system

Built with a focus on **clean architecture, security, and scalability**.

---

## ⚙️ Tech Stack

| Layer | Technology |
|------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (NeonDB) |
| Auth | JWT |
| Security | bcryptjs |

---

## 🚀 Features

- 🔐 JWT Authentication & Role-based Authorization
- 🛒 Order lifecycle with strict status transitions
- 🏪 Seller inventory management
- ⭐ Verified purchase reviews
- 🛡 Admin dashboard & controls
- ⚡ Prisma transactions for data integrity
- 📦 Scalable layered architecture

---

## 📁 Project Structure


```
medistore-server/
├── prisma/
│   └── schema.prisma             # Database schema and models
├── src/
│   ├── config/
│   │   └── env.ts                # Typed environment variable config
│   ├── errors/                   # Custom error classes
│   ├── lib/                      # Shared libraries and helpers
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT authentication + role-based access
│   │   └── error.middleware.ts   # Global error handler
│   ├── modules/
│   │   ├── auth/                 # Register, login, get current user
│   │   ├── medicine/             # Public medicine browsing
│   │   ├── category/             # Medicine categories
│   │   ├── order/                # Customer order management
│   │   ├── seller/               # Seller inventory + order fulfillment
│   │   ├── admin/                # Admin dashboard + user management
│   │   └── review/               # Medicine reviews
│   ├── prisma/
│   │   └── client.ts             # Singleton Prisma client
│   ├── routes/                   # Centralized route registration
│   ├── types/
│   │   └── express.d.ts          # Express Request type augmentation
│   ├── utils/
│   │   ├── sendResponse.ts       # Unified API response helper
│   │   └── AppError.ts           # Custom error class
│   ├── app.ts                    # Express app setup and middleware
│   └── server.ts                 # Server entry point
├── seed.ts                       # Database seeder
├── .env                          # Environment variables (git ignored)
├── .gitignore
├── tsconfig.json
└── package.json
```


---

## 🛠️ Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL (NeonDB recommended)
- npm

---

### Installation

```bash
git clone https://github.com/israk03/medistore-server.git
cd medistore-server

npm install

cp .env.example .env

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
PORT=5000
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech:6543/medistore?sslmode=require&pgbouncer=true"
JWT_SECRET="your_super_secret_jwt_key_here"
NODE_ENV="development"
```

> **Important:** Always use NeonDB's pooled connection string on port `6543` with `?pgbouncer=true`. Port `5432` may be blocked on home or public WiFi.

---

## Database Setup

```bash
npx prisma migrate dev
npx prisma generate
npm run seed
```

---

## Run Server

```bash
npm run dev
```

---

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run seed
npm run db:migrate
npm run db:generate
npm run db:studio
```

---

## Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `CUSTOMER` | Users who purchase medicines | Browse, order, track, review |
| `SELLER` | Medicine vendors / pharmacies | Manage inventory, fulfill orders |
| `ADMIN` | Platform moderators | Manage all users and orders |

> **Note:** Admin accounts are seeded directly — not self-registered. Users select `CUSTOMER` or `SELLER` during registration.

---

## API Endpoints

Base URL: `http://localhost:5000`

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register as CUSTOMER or SELLER |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Private | Get current authenticated user |

### Medicines

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/medicines` | Public | Get all medicines with filters |
| GET | `/api/medicines/:id` | Public | Get single medicine detail with reviews |

**Supported query params for `GET /api/medicines`:**

```
?search=paracetamol
?categoryId=<uuid>
?minPrice=10&maxPrice=200
?page=1&limit=12
```

### Categories

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/categories` | Public | Get all categories |
| POST | `/api/categories` | ADMIN | Create a new category |
| DELETE | `/api/categories/:id` | ADMIN | Delete a category |

### Orders

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | CUSTOMER | Place a new order (Cash on Delivery) |
| GET | `/api/orders` | CUSTOMER | Get my order history |
| GET | `/api/orders/:id` | CUSTOMER | Get single order detail |
| PATCH | `/api/orders/:id/cancel` | CUSTOMER | Cancel a PLACED order |

### Seller

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/seller/medicines` | SELLER | Get my medicine inventory |
| POST | `/api/seller/medicines` | SELLER | Add a new medicine |
| PUT | `/api/seller/medicines/:id` | SELLER | Update a medicine |
| DELETE | `/api/seller/medicines/:id` | SELLER | Remove a medicine |
| GET | `/api/seller/orders` | SELLER | Get orders containing my medicines |
| PATCH | `/api/seller/orders/:id/status` | SELLER | Update order status |

### Admin

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/stats` | ADMIN | Platform dashboard statistics |
| GET | `/api/admin/users` | ADMIN | Get all users (filter by role) |
| PATCH | `/api/admin/users/:id/status` | ADMIN | Ban or unban a user |
| GET | `/api/admin/orders` | ADMIN | Get all orders (filter by status) |
| GET | `/api/admin/orders/:id` | ADMIN | Get single order detail |

### Reviews

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reviews/medicine/:medicineId` | Public | Get all reviews for a medicine |
| POST | `/api/reviews/medicine/:medicineId` | CUSTOMER | Add a review (verified purchase only) |
| DELETE | `/api/reviews/:id` | CUSTOMER | Delete your own review |

---

## Response Format

Every endpoint returns a consistent JSON shape.

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Medicines fetched successfully",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Medicine not found"
}
```

---

## Order Status Flow

```
PLACED ──→ PROCESSING ──→ SHIPPED ──→ DELIVERED
  │
  └──→ CANCELLED
```

| Transition | Actor |
|-----------|-------|
| PLACED → PROCESSING | Seller confirms order |
| PLACED → CANCELLED | Customer or Seller |
| PROCESSING → SHIPPED | Seller ships order |
| SHIPPED → DELIVERED | Seller marks delivered |

> Orders in `DELIVERED` or `CANCELLED` state are terminal — no further transitions allowed.

---

## Database Schema

| Model | Description |
|-------|-------------|
| `User` | All users with role (`CUSTOMER`, `SELLER`, `ADMIN`) and ban status |
| `Category` | Medicine categories managed by Admin |
| `Medicine` | Medicine listings linked to a Seller with stock tracking |
| `Order` | Customer orders with shipping address and current status |
| `OrderItem` | Line items within an order — stores `unitPrice` at time of purchase |
| `Review` | Verified purchase reviews with rating (1–5) and optional comment |

---

## Architecture

This project follows a strict layered **MVC + Service** pattern:

```
Request → Route → Middleware → Controller → Service → Prisma → Database
                                   ↓
                             sendResponse()
```

| Layer | Responsibility |
|-------|----------------|
| **Routes** | Define endpoints, attach middleware |
| **Controllers** | Parse request, call service, send response |
| **Services** | All business logic and Prisma queries |
| **Middleware** | Auth verification, role guards, error handling |
| **Utils** | Shared helpers: `sendResponse`, `AppError` |

---

## Seed Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medistore.com | admin123 |
| Seller | seller@medistore.com | seller123 |
| Customer | customer@medistore.com | customer123 |

---

## Author

**Israk** — Full Stack Developer  
GitHub: [@israk03](https://github.com/israk03)