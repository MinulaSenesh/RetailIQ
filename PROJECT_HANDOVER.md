# 📦 Project Handover: Zyvora & RetailIQ

Welcome to your new enterprise ecosystem. This document provides everything you need to manage the **Zyvora** storefront and the **RetailIQ** administration platform.

---

## 🔗 System Access

| Platform | URL | Purpose |
| :--- | :--- | :--- |
| **Zyvora Storefront** | [http://localhost:3001/shop](http://localhost:3001/shop) | Customer shopping experience |
| **RetailIQ Admin** | [http://localhost:3000/auth/login](http://localhost:3000/auth/login) | Management, Inventory, & Analytics |

### **Credentials**

| Role | Email / Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@retailiq.com` | `password` |
| **Manager** | `manager@retailiq.com` | `password` |
| **Analyst** (Read-Only) | `analyst@retailiq.com` | `password` |
| **Customer (Test)** | `customer.test@zyvora.com` | `Password123!` |

---

## ✨ Key Features Delivered

### **1. Premium Branding (Zyvora)**
- **Visual Identity**: High-contrast Red/Black luxury theme with custom "Geometric Z" logo.
- **High-Resolution Catalog**: Every product is mapped to specific, professional imagery curated for your inventory.

### **2. Role-Based Security (RBAC)**
- **Analyst Mode**: A restricted view for your reporting team. Analysts can view data but cannot delete history or update order statuses.
- **Audit Logs**: All major system changes are tracked for transparency.

### **3. Operational Tools**
- **CSV ETL Pipeline**: Export your sales reports and re-import them directly into the analytics engine.
- **Diagnostic UI**: Uploading a file with errors? Click the "Eye" icon in the upload history to see exactly which columns are missing or invalid.

### **4. Payment Integrations**
- Safe, production-ready simulations for **PayHere**, **WEBXPAY**, and **Cash on Delivery**.

---

## 🛠️ Management Guide

### **How to Update Product Images**
1. Ensure the `image_url` field is populated in the database.
2. The storefront will automatically prioritize this URL over generic placeholders.

### **How to Run Local Analytics**
The analytics engine requires the Python service to be running. It automatically processes CSV uploads and generates the charts seen on the Admin Dashboard.

---

## 📝 Technical Stack
- **Backend**: Spring Boot 3.x (Java), Hibernate/JPA, Flyway (Migrated to V9).
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons.
- **Analytics**: Python, FastAPI, SQLAlchemy, NumPy.
- **Database**: MySQL 8.0.

---

*Delivered with excellence, March 2026.*
