# 📄 Project Submission Document

## Project: Mini ERP + CRM Operations Portal (`Durga Enterprise`)

---

## 1. 🔗 GitHub Repository Link
* **GitHub Repository URL**: [https://github.com/vinay6314/Durga-Enterprise.git](https://github.com/vinay6314/Durga-Enterprise.git)

---

## 2. 🌐 Live Frontend URL
* **Production Live Frontend**: [https://durga-enterprise.vercel.app](https://durga-enterprise.vercel.app) *(or Render Static Site)*
* **Local Development Frontend**: `http://localhost:3000`

---

## 3. ⚙️ Live Backend API URL
* **Production Live Backend API**: [https://durga-enterprise.onrender.com/api](https://durga-enterprise.onrender.com/api)
* **Live Health Check Endpoint**: [https://durga-enterprise.onrender.com/health](https://durga-enterprise.onrender.com/health)
* **Local Development Backend API**: `http://localhost:5000/api`

---

## 4. 🔐 Test Login Credentials for All Roles

All accounts share organization-wide enterprise operational data. Log in with any role to experience role-based access control (RBAC):

| Role | Email | Password | Access Rights & Operational Privileges |
| :--- | :--- | :--- | :--- |
| 🛡️ **ADMIN** | `vinaychoudary63@gmail.com` | `Admin@123` | Full system access: CRM Database, Inventory Catalog, Sales Challans, PDF Exports & Stock Audit Logs |
| 💼 **SALES** | `sales@erp.com` | `Sales@123` | Customer CRM management (Add/Edit/Delete), Create Sales Challans & Invoices |
| 📦 **WAREHOUSE** | `warehouse@erp.com` | `Warehouse@123` | Product catalog, Stock IN (+) & Stock OUT (-) adjustments with reason logs & PDF audit reports |
| 📊 **ACCOUNTS** | `accounts@erp.com` | `Accounts@123` | View Sales Challans, monitor Grand Totals, and Download Official PDF Tax Invoices |

---

## 5. 📄 Postman Collection & API Documentation

A complete Postman collection is committed at **[`./Postman_Collection.json`](./Postman_Collection.json)** in the repository root.

### Core Endpoints

#### Authentication & Profile
- `POST /api/auth/login` — User authentication & JWT token issuance
- `POST /api/auth/register` — User registration
- `GET /api/auth/me` — Get current user profile
- `PUT /api/auth/profile` — Update display name & password

#### Customer CRM Module
- `GET /api/customers` — Search & list customers (Paginated)
- `GET /api/customers/:id` — Get customer profile & follow-up notes
- `POST /api/customers` — Create customer record
- `PUT /api/customers/:id` — Update customer profile
- `DELETE /api/customers/:id` — Delete customer record
- `POST /api/customers/:id/follow-up` — Append follow-up note

#### Product & Inventory Module
- `GET /api/products` — List products & stock balances
- `GET /api/products/:id` — Get product detail
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `POST /api/products/stock-movement` — Record Stock IN (+) / Stock OUT (-)
- `GET /api/products/stock-movements` — Stock audit log history
- `GET /api/products/stock-movements/pdf` — Download Stock Audit PDF Report

#### Sales Challans & Invoices
- `GET /api/challans` — List sales challans with filters & search
- `GET /api/challans/:id` — Get sales challan snapshot
- `POST /api/challans` — Create sales challan (auto-deducts stock & stores product snapshots)
- `PUT /api/challans/:id/status` — Update challan status (DRAFT / CONFIRMED / CANCELLED)
- `GET /api/challans/:id/pdf` — Download official PDF Tax Invoice (with digital stamp seal)

---

## 💻 6. Setup & Deployment Instructions

### Environment Variables

#### Backend Environment Variables (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="file:./dev.db"
JWT_SECRET="durga_enterprise_super_secret_jwt_key_2026"
CORS_ORIGIN="*"
```

#### Frontend Environment Variables (`frontend/.env`)
```env
VITE_API_URL=https://durga-enterprise.onrender.com/api
```

---

### Local Running Instructions

```bash
# 1. Clone Repository
git clone https://github.com/vinay6314/Durga-Enterprise.git
cd Durga-Enterprise

# 2. Backend Setup
cd backend
npm install
npm run db:setup    # Applies Prisma migrations, generates client & seeds test data
npm run dev         # Runs backend API on http://localhost:5000

# 3. Frontend Setup (in a separate terminal)
cd ../frontend
npm install
npm run dev         # Runs Vite frontend on http://localhost:3000
```

---

### Docker Deployment Instructions (Bonus Point)

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 🏗️ 7. Short Explanation of Architecture

```
 ┌──────────────────────────────────────────────────────────────┐
 │                    React Frontend (Vite)                     │
 │  - Custom UI Token System (Nordic Light & Dark Modes)         │
 │  - Context API State Management (AuthContext, ThemeContext)  │
 │  - SVG Stamp Seal Rendering Engine                           │
 └──────────────────────────────┬───────────────────────────────┘
                                │ REST HTTP (Axios + Bearer JWT)
 ┌──────────────────────────────▼───────────────────────────────┐
 │                     Express Node.js API                      │
 │  - JWT Auth Middleware & Role-Based Access Control (RBAC)    │
 │  - Zod Data Validation Schemas                              │
 │  - PDFKit Vector Document Engine                             │
 └──────────────────────────────┬───────────────────────────────┘
                                │ Prisma ORM
 ┌──────────────────────────────▼───────────────────────────────┐
 │                      Database Layer                          │
 │  - SQLite (Development) / PostgreSQL (Production Compatible) │
 └──────────────────────────────────────────────────────────────┘
```

1. **Frontend Layer**: Built with React 18, TypeScript, and Vite. Features a responsive admin dashboard UI with Nordic Light & Dark modes, glassmorphic drawers, custom toast notifications, and SVG stamp seal graphics.
2. **Backend API Layer**: Express REST API in TypeScript enforcing JWT authentication, `authorizeRoles` RBAC middleware, and Zod input schema validation.
3. **Database Layer**: Prisma ORM managing SQLite/PostgreSQL schemas with automatic data seeding and relational cascading deletes.
4. **PDF Document Builder**: Dynamic vector PDF generation powered by `pdfkit` for generating print-ready tax invoices and audit log reports.

---

## ⚠️ 8. Known Limitations & Assumptions

### Assumptions Made
1. **Shared Operations Data**: All roles access the company operations workspace to ensure seamless data handoff between Sales, Warehouse, Accounts, and Admin.
2. **Historical Price Accuracy**: Sales Challans store frozen product snapshot data (SKU, product name, price at time of order creation) to preserve historical accuracy even if catalog prices change later.

### Known Limitations
1. **Local SQLite Database Engine**: Uses local SQLite storage (`dev.db`). For cloud multi-instance auto-scaling deployments, `schema.prisma` provider can be switched to `postgresql`.
2. **Direct Browser PDF Downloads**: PDF downloads trigger direct browser binary downloads (`Content-Disposition: attachment`).
