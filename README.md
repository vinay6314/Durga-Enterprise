# 🚀 Durga Enterprise — Mini ERP & CRM Portal

A full-stack Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) application built with React, TypeScript, Node.js, Express, Prisma ORM, and SQLite / PostgreSQL.

![Durga Enterprise Portal](https://img.shields.io/badge/Durga%20Enterprise-Operations%20Portal-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)

---

## 📌 Project Submission Overview

| Requirement Item | Submission Details |
| :--- | :--- |
| **1. GitHub Repository Link** | [https://github.com/vinay6314/Durga-Enterprise.git](https://github.com/vinay6314/Durga-Enterprise.git) |
| **2. Live Frontend URL** | `http://localhost:3000` *(Local Dev Server)* |
| **3. Live Backend API URL** | `http://localhost:5000` *(Local Express API)* |
| **4. Test Credentials** | Listed in table below (ADMIN, SALES, WAREHOUSE, ACCOUNTS) |
| **5. API Documentation** | Included in [Postman_Collection.json](./Postman_Collection.json) & detailed section below |
| **6. Setup & Deployment** | Step-by-step local running & Docker guide below |
| **7. Architecture Summary** | Express Node.js REST API + React SPA + Prisma ORM + PDFKit |
| **8. Known Limitations** | Documented below |

---

## 🔑 4. Test Login Credentials for All Roles

All accounts share organization-wide enterprise operational data. Log in with any role to experience role-specific access controls:

| Role | Email | Password | Access Rights & Privileges |
| :--- | :--- | :--- | :--- |
| 🛡️ **ADMIN** | `vinaychoudary63@gmail.com` | `Admin@123` | Full system access to CRM, Inventory, Sales Challans, PDF Downloads & Stock Audit Logs |
| 💼 **SALES** | `sales@erp.com` | `Sales@123` | Customer CRM management (Add/Edit/Delete), Create Sales Challans & Invoices |
| 📦 **WAREHOUSE** | `warehouse@erp.com` | `Warehouse@123` | Manage product catalog, record Stock IN (+) / Stock OUT (-) adjustments & Stock Audit logs |
| 📊 **ACCOUNTS** | `accounts@erp.com` | `Accounts@123` | View Sales Challans, monitor Grand Totals, and Download Official PDF Invoices |

---

## 📜 5. API Documentation & Postman Collection

A complete Postman collection is included in the repository root at **[Postman_Collection.json](./Postman_Collection.json)**.

### Core Endpoints

#### Authentication & Account Profile
- `POST /api/auth/login` — Authenticate user and receive JWT token.
- `POST /api/auth/register` — Create a new user account.
- `GET /api/auth/me` — Fetch currently authenticated user profile.
- `PUT /api/auth/profile` — Update logged-in user display name & change password.

#### Customer CRM Database
- `GET /api/customers` — List all customers with search & pagination.
- `GET /api/customers/:id` — Get customer details and interaction history.
- `POST /api/customers` — Create a new customer profile.
- `PUT /api/customers/:id` — Edit customer details.
- `DELETE /api/customers/:id` — Delete a customer record.
- `POST /api/customers/:id/follow-up` — Add follow-up notes.

#### Inventory & Product Management
- `GET /api/products` — List all products and stock balances.
- `POST /api/products` — Create a new product in catalog.
- `POST /api/products/stock-movement` — Record Stock IN / Stock OUT movement.
- `GET /api/products/stock-movements` — Fetch inventory movement audit logs.
- `GET /api/products/stock-movements/pdf` — Download Stock Audit Log PDF.

#### Sales Challans & Invoices
- `GET /api/challans` — List sales challans with search & filters.
- `GET /api/challans/:id` — Get single sales challan snapshot.
- `POST /api/challans` — Create a new sales challan (auto-deducts inventory stock).
- `GET /api/challans/:id/pdf` — Download print-ready Tax Invoice PDF (with digital stamp seal).

---

## 💻 6. Setup & Deployment Instructions

### Local Development Setup

#### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

#### Step 1: Clone Repository
```bash
git clone https://github.com/vinay6314/Durga-Enterprise.git
cd Durga-Enterprise
```

#### Step 2: Backend Setup & Database Seeding
```bash
cd backend
npm install
npm run db:setup    # Generates Prisma client, applies migrations, and seeds test data
npm run dev         # Starts backend API on http://localhost:5000
```

#### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev         # Starts Vite frontend on http://localhost:3000
```

---

### 🐳 Docker Deployment

The application is containerized with Docker and Docker Compose.

```bash
# From project root directory
docker-compose up --build
```
- **Frontend App**: Accessible at `http://localhost:3000`
- **Backend API**: Accessible at `http://localhost:5000`

---

## 🏗️ 7. Architecture Explanation

The application follows a **Decoupled Client-Server REST Architecture**:

```
 ┌─────────────────────────────────────────────────────────┐
 │                   React Frontend (Vite)                │
 │  - Custom UI Token System (Nordic Light & Dark Modes)    │
 │  - Context API State Management (AuthContext, Theme)   │
 │  - SVG Stamp Seal Rendering Engine                      │
 └────────────────────────────┬────────────────────────────┘
                              │ REST HTTP Requests (Axios + JWT)
 ┌────────────────────────────▼────────────────────────────┐
 │                  Express Node.js API                   │
 │  - JWT Auth Middleware & Role-Based Access Control     │
 │  - Zod Data Validation Schemas                         │
 │  - PDFKit Vector Document Builder (Binary PDF Blobs)   │
 └────────────────────────────┬────────────────────────────┘
                              │ Prisma ORM
 ┌────────────────────────────▼────────────────────────────┐
 │                     SQLite Database                     │
 │  - User, Customer, Product, SalesChallan, StockMovement │
 └─────────────────────────────────────────────────────────┘
```

1. **Frontend Layer**: Built with React 18, TypeScript, and Vite. Implements a rich design system with dynamic HSL color tokens, dark/light theme switching, responsive navigation drawers, and custom SVG official stamp seals.
2. **Backend API Layer**: Express server written in TypeScript. Implements strict JWT token verification, RBAC authorization middleware, and Zod input validation.
3. **Database Layer**: Managed by Prisma ORM. Uses SQLite for zero-config local development and can be switched to PostgreSQL for cloud production deployment by updating `DATABASE_URL` in `schema.prisma`.
4. **PDF Engine**: Dynamic vector PDF generation powered by `pdfkit`. Generates high-resolution tax invoices with auto-calculated totals, custom headers, and dynamic user role signatures.

---

## ⚠️ 8. Known Limitations & Recommendations

1. **Database Storage**: Uses local SQLite storage (`dev.db`). For high-concurrency cloud production deployments, recommended to connect to PostgreSQL / MySQL via Prisma.
2. **Direct Browser PDF Downloads**: PDF downloads trigger direct browser binary downloads (`Content-Disposition: attachment`). Browser popup blockers do not interfere with standard blob downloads.
3. **File Attachments**: Customer follow-up notes accept rich text descriptions; image cloud uploads can be connected via AWS S3 / Cloudinary if needed in future releases.
