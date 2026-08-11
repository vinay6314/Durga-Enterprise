# 🚀 Durga Enterprise — Mini ERP + CRM Operations Portal

A full-stack Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) application built for wholesale and distribution business workflows.

![Durga Enterprise Portal](https://img.shields.io/badge/Durga%20Enterprise-Operations%20Portal-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)

---

## 📋 Submission Requirements Checklist

| # | Submission Item | Details & Location |
| :--- | :--- | :--- |
| **1** | **GitHub Repository Link** | 🔗 **[https://github.com/vinay6314/Durga-Enterprise.git](https://github.com/vinay6314/Durga-Enterprise.git)** |
| **2** | **Live Frontend URL** | 🌐 **`http://localhost:3000`** *(Vite Dev Server / Production Build)* |
| **3** | **Live Backend API URL** | ⚙️ **`http://localhost:5000`** *(Node.js Express REST API)* |
| **4** | **Test Login Credentials** | 🔐 Credentials provided below for all 4 RBAC roles |
| **5** | **Postman Collection & API Docs** | 📄 Included at **[`./Postman_Collection.json`](./Postman_Collection.json)** & detailed API specs below |
| **6** | **README Setup & Deployment** | 📖 Complete setup, Docker, Environment Variables & Cloud Deployment guide below |
| **7** | **Architecture Explanation** | 🏗️ Detailed architectural flow & tech stack breakdown below |
| **8** | **Known Limitations & Assumptions** | ⚠️ Documented below |

---

## 🔐 4. Test Login Credentials for All Roles

The system uses Role-Based Access Control (RBAC). All team members share organization-wide enterprise operational data:

| Role | Email | Password | Access Rights & Privileges |
| :--- | :--- | :--- | :--- |
| 🛡️ **ADMIN** | `vinaychoudary63@gmail.com` | `Admin@123` | Full system access to CRM, Inventory, Sales Challans, PDF Exports & Stock Audit Logs |
| 💼 **SALES** | `sales@erp.com` | `Sales@123` | Customer CRM management (Add/Edit/Delete), Create Sales Challans & Invoices |
| 📦 **WAREHOUSE** | `warehouse@erp.com` | `Warehouse@123` | Product catalog, Stock IN (+) & Stock OUT (-) adjustments with reason logs & PDF reports |
| 📊 **ACCOUNTS** | `accounts@erp.com` | `Accounts@123` | View Sales Challans, monitor Grand Totals, and Download Official PDF Tax Invoices |

---

## 🌟 Core Modules Implemented

### 1. Authentication & Roles (JWT + RBAC)
- Secure JWT authentication with bcrypt password hashing (10 rounds).
- RBAC middleware (`authorizeRoles`) protecting backend routes based on user role.
- Dynamic account profile editing (Full Display Name & Password change modal).

### 2. Customer CRM Module
- **Fields**: Customer Name, Mobile Number, Email, Business Name, GST Number (Optional), Customer Type (`Retail`, `Wholesale`, `Distributor`), Address, Status (`Lead`, `Active`, `Inactive`), Follow-up Date, Notes.
- **Features**: Add Customer, Edit Customer, Search/Filter, Delete Customer with safety modal, View Detail Page, and Append Follow-up Notes history.

### 3. Product & Inventory Module
- **Fields**: Product Name, SKU/Code, Category, Unit Price, Current Stock Balance, Minimum Stock Alert Quantity, Location/Warehouse.
- **Stock Movement Log**: Tracks Product, Quantity Changed, Movement Type (`IN` or `OUT`), Reason, Created By (User & Role), and Timestamp.
- **Audit Reports**: Instant PDF generation & download for Stock Movement Logs.

### 4. Sales Challan Module & Invoices
- **Features**: Select Customer, Add multiple line items with custom quantities, Auto-generated Challan Number (`CHL-YYYYMMDD-XXXX`), Save as `DRAFT`, `CONFIRMED`, or `CANCELLED`.
- **Business Logic Enforced**:
  - Stock is automatically deducted when a challan is **CONFIRMED**.
  - Prevents negative inventory stock with error feedback.
  - Stores complete **Product Snapshot Data** (Name, SKU, Price at creation time) so historical invoices remain accurate even if product prices change later.
- **PDF Export**: Vector PDF invoice generation featuring the official **Durga Enterprise Digital Stamp Seal**, dynamic signature, and local file download.

---

## 📜 5. API Documentation & Endpoints

Postman Collection File: **[`Postman_Collection.json`](./Postman_Collection.json)**

### Endpoint Overview
```
POST   /api/auth/login                  - User login (returns JWT token)
POST   /api/auth/register               - User registration
GET    /api/auth/me                     - Current authenticated user profile
PUT    /api/auth/profile                - Update display name & password

GET    /api/customers                   - Search & list customers (Paginated)
GET    /api/customers/:id               - Get customer profile & follow-ups
POST   /api/customers                   - Create customer
PUT    /api/customers/:id               - Update customer
DELETE /api/customers/:id               - Delete customer
POST   /api/customers/:id/follow-up     - Add follow-up note

GET    /api/products                    - List products & stock balances
GET    /api/products/:id                - Get product detail
POST   /api/products                    - Create product
PUT    /api/products/:id                - Update product
POST   /api/products/stock-movement     - Record Stock IN (+) / Stock OUT (-)
GET    /api/products/stock-movements    - Audit logs list
GET    /api/products/stock-movements/pdf- PDF audit report download

GET    /api/challans                    - List sales challans (Paginated)
GET    /api/challans/:id                - Get single sales challan snapshot
POST   /api/challans                    - Create sales challan (auto-deducts stock)
PUT    /api/challans/:id/status         - Update status (DRAFT/CONFIRMED/CANCELLED)
GET    /api/challans/:id/pdf            - Download PDF Tax Invoice
```

---

## 💻 6. Setup & Deployment Instructions

### Environment Variables Management
Environment variables are configured in `backend/.env` (or inherited via Docker environment):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="durga-enterprise-super-secret-jwt-key-2026"
CORS_ORIGIN="http://localhost:3000"
```

### Local Development Setup

#### Prerequisites
- Node.js (v18+)
- npm (v9+)

#### Step 1: Clone Repository
```bash
git clone https://github.com/vinay6314/Durga-Enterprise.git
cd Durga-Enterprise
```

#### Step 2: Backend Setup
```bash
cd backend
npm install
npm run db:setup    # Applies Prisma schema, seeds users, customers & products
npm run dev         # Runs backend API on http://localhost:5000
```

#### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev         # Runs Vite frontend on http://localhost:3000
```

---

### 🐳 Docker Setup (Bonus Point Achieved)

Run the entire application (Frontend + Backend + Database) in containerized isolation:

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

### 🌐 Cloud Deployment Options (Vercel / Render / Supabase)

#### Frontend Deployment (Vercel / Netlify / Render Static Site)
1. Set Root Directory to `frontend`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`

#### Backend Deployment (Render / Railway / Fly.io)
1. Set Root Directory to `backend`.
2. Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
3. Start Command: `npm run start`
4. Set Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.

---

## 🏗️ 7. Architecture Explanation

The application follows a **Decoupled Tiered REST Architecture**:

```
 ┌─────────────────────────────────────────────────────────────────┐
 │                     React Frontend (Vite)                       │
 │  - Design System with HSL Color Tokens & Theme Provider         │
 │  - Context API State Management (AuthContext, ThemeContext)     │
 │  - Modular UI Components (Modal, Header, Toast, StampSeal)      │
 └────────────────────────────────┬────────────────────────────────┘
                                  │ REST HTTP (Axios + Bearer JWT)
 ┌────────────────────────────────▼────────────────────────────────┐
 │                      Node.js Express API                        │
 │  - Authentication Middleware (Passport / JWT Verification)      │
 │  - Role-Based Access Control (authorizeRoles Middleware)        │
 │  - Input Validation via Zod Schemas                             │
 │  - PDF Vector Rendering Engine (PDFKit)                         │
 └────────────────────────────────┬────────────────────────────────┘
                                  │ Prisma ORM
 ┌────────────────────────────────▼────────────────────────────────┐
 │                        Database Layer                           │
 │  - SQLite (Local Dev) / PostgreSQL (Production Compatible)      │
 └─────────────────────────────────────────────────────────────────┘
```

1. **Frontend**: Component-driven architecture using React 18, TypeScript, and Vite. Utilizes CSS variables for seamless light/dark theme switching and dynamic user profile badges.
2. **Backend**: Express REST API structured with Controllers, Routes, Services, and Middlewares. Routes enforce strict schema parsing using Zod.
3. **Database & ORM**: Model definitions structured in `prisma/schema.prisma`. Cascading deletes and relation handling ensure database integrity across sales challans, products, and customer follow-up notes.
4. **PDF Generation**: Native binary PDF compilation on the server using `pdfkit`. Automatically streams PDF blobs directly to local device downloads.

---

## 📌 8. Assumptions & Known Limitations

### Assumptions Made
1. **Shared Enterprise Workspace**: All team roles operate within the organization workspace (Durga Enterprise), ensuring data consistency across Sales, Warehouse, Accounts, and Admin.
2. **Auto Challan Numbering**: Challan numbers are auto-generated using timestamp strings formatted as `CHL-YYYYMMDD-XXXX`.
3. **Product Price Snapshots**: Line items in sales challans save product snapshot details at creation time to prevent historical invoice distortion if catalog prices are later modified.

### Known Limitations
1. **Local SQLite Engine**: Default setup uses local SQLite database file `dev.db`. For cloud multi-instance auto-scaling deployments, `schema.prisma` provider can be switched to `postgresql`.
2. **Image Storage**: Product catalog uses standard text SKU/codes. AWS S3 bucket integration can be attached for uploading product thumbnail images.
