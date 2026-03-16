# 💎 Zyvora & RetailIQ: Premium E-commerce Ecosystem

A high-performance, full-stack e-commerce solution bridging the gap between a luxury customer experience and a secure, data-driven administrative backend.

---

## 🚀 Key Features

### **Zyvora Storefront (Customer Experience)**
*   **Luxury Identity**: A sleek, high-contrast "Geometric Red & Black" branding system.
*   **Curated Catalog**: Optimized support for high-resolution, specific product imagery.
*   **Secure Checkout**: Production-ready payment flows supporting **PayHere**, **WEBXPAY**, and Cash on Delivery.
*   **Dynamic Search**: Lightning-fast product indexing and discovery.

### **RetailIQ Dashboard (Admin & Analytics)**
*   **Role-Based Security (RBAC)**: Granular permission levels including a read-only "Analyst" mode to protect sensitive data.
*   **Data Intelligence**: Python-powered ETL service for sales forecasting and automated report generation.
*   **Diagnostic Tools**: Built-in CSV validation with a unique "Diagnostic Eye" UI to spot file errors instantly.
*   **Idempotent Migrations**: Reliable database schema management using Flyway.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Java 17, Spring Boot 3.x, Hibernate/JPA, Flyway |
| **Analytics Engine** | Python 3.11, FastAPI, SQLAlchemy, NumPy |
| **Primary Database** | MySQL 8.0 |
| **DevOps/Tools** | Git, Maven, NPM |

---

## 📦 Getting Started

### **Prerequisites**
*   JDK 17+
*   Node.js 18+
*   Python 3.10+
*   MySQL 8.0

### **Quick Setup**

1.  **Database**: Create a schema named `retailiq` in MySQL.
2.  **Backend**:
    ```bash
    cd retailiq-api
    mvn spring-boot:run
    ```
3.  **Frontend**:
    ```bash
    cd retailiq-frontend
    npm install
    npm run dev
    ```
4.  **Analytics Service**:
    ```bash
    cd retailiq-analytics
    pip install -r requirements.txt
    python main.py
    ```

---

## 🔐 Access Credentials (Demo)

*   **Test Customer**: `customer.test@zyvora.com` / `Password123!`

---

## 🎨 Design Vision
The project follows a "Luxury Geometric" philosophy—clean lines, high-impact typography, and a "Customer First" approach to both the storefront and the management tools.

---

*Built with passion and technical excellence.*
