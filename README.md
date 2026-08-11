# 🚀 Durga Enterprise — Mini ERP & CRM System

A full-stack Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) application built with React, TypeScript, Node.js, Express, Prisma, and SQLite.

![Durga Enterprise Portal](https://img.shields.io/badge/Durga%20Enterprise-Operations%20Portal-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge)

---

## ✨ Features & Capabilities

### 👥 Multi-Role Enterprise Access Control (RBAC)
* **ADMIN**: Full system access to Customer CRM, Inventory Management, Sales Challan Creation, PDF Generation, and System Audit Logs.
* **SALES**: Manage Customer CRM database, add/edit customer profiles, and generate Sales Challans & Invoices.
* **WAREHOUSE**: Manage product catalog, record Stock IN (+) & Stock OUT (-) movements with reason logs, and download Stock Audit PDF reports.
* **ACCOUNTS**: View company sales challans, track grand total values, and download official PDF Tax Invoices.

### 💼 Customer CRM Database
* Full Customer Management: Add new customers, edit profiles, and delete records with safety confirmation.
* Rich metadata: Full Name, Business Name, Mobile, Email, GST Number, Customer Type (Retail / Wholesale / Distributor), Status (Lead / Active / Inactive), Follow-up Dates, and Notes.

### 📦 Product & Inventory Catalog
* Complete product inventory with SKU, Name, Description, Unit Price, Stock Balance, and Category.
* Automatic stock deduction upon confirming Sales Challans.
* Audit Log Report generation for all inventory movements with PDF export.

### 📄 Sales Challans & Official Tax Invoices
* Generate official Sales Challans with auto-calculated unit totals and grand totals.
* Official **Durga Enterprise Digital Stamp Seal** with dynamic signature and RBAC user role stamp.
* **Direct Local PDF Download**: Export crisp, print-ready PDF Invoices directly to local device storage.

### 🎨 Modern UI & Theme System
* **Nordic Light Mode & Dark Mode**: One-tap theme toggle switch in the top header.
* Fully responsive layout with mobile off-canvas drawer and glassmorphic bottom navigation dock.
* Dynamic Account Settings modal for updating display name and password.

---

## 🛠️ Tech Stack

* **Frontend**: React (v18), TypeScript, Lucide React Icons, Custom Modular CSS Variables
* **Backend**: Node.js, Express, TypeScript, Prisma ORM, Zod Validation, PDFKit
* **Database**: SQLite (Development) / PostgreSQL compatible
* **Authentication**: JWT (JSON Web Tokens) with Bcrypt Password Hashing

---

## 🚦 Getting Started

### 1. Prerequisites
* Node.js (v18+ recommended)
* npm / npx

### 2. Backend Setup
```bash
cd backend
npm install
npm run db:setup   # Runs Prisma migrations & seeds initial database
npm run dev        # Starts backend server on port 5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Starts Vite frontend dev server on port 3000
```

---

## 🔐 Quick Access Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `vinaychoudary63@gmail.com` | `Admin@123` |
| **SALES** | `sales@erp.com` | `Sales@123` |
| **WAREHOUSE** | `warehouse@erp.com` | `Warehouse@123` |
| **ACCOUNTS** | `accounts@erp.com` | `Accounts@123` |

---

## 📄 License
Distributed under the MIT License. Developed for **Durga Enterprise Operations**.
