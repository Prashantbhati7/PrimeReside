# PrimeReside: A Web-Based Property Management & Discovery System

PrimeReside is a full-stack web application designed to facilitate secure and efficient interactions between property managers and tenants through an integrated digital platform.

---

## 🏗 Technical Architecture

### **Frontend Implementation**
The frontend is architected using **Next.js 14** (App Router) to leverage server-side rendering (SSR) for optimized initial load times and client-side navigation for enhanced user experience.

*   **State Management & Data Synchronization**: 
    *   **Redux Toolkit & RTK Query**: Implemented for global state management and efficient server-data caching. RTK Query's automated cache invalidation logic is utilized to ensure data consistency across components.
*   **Validation & Form Management**: 
    *   **React Hook Form & Zod**: Utilized for complex data entry modules, such as property creation, ensuring robust client-side schema validation and type-safe data handling.
*   **Geospatial Integration**: 
    *   **Leaflet.js**: Integrated to provide an interactive mapping interface for coordinate-based property discovery.

### **Backend & Database Infrastructure**
*   **Runtime Environment**: Node.js with the Express framework facilitates a RESTful API architecture.
*   **Database Management System**: **PostgreSQL** is utilized for relational data integrity.
*   **Geospatial Processing**: **PostGIS** extension is leveraged to perform high-performance geographic calculations (e.g., coordinate extraction and distance-based filtering).
*   **Authentication & Authorization**: Implemented JSON Web Token (JWT) based authentication with role-based access control (RBAC).

---

## 🚀 Deployment and Execution

### **Environment Configuration**
The system requires environment variables to be defined in `.env` files within both the `/client` and `/backend` directories. These include database connection parameters, authentication secrets, and third-party API configurations.

### **Dependency Installation**
Standardized package management is utilized via **npm**. Install required dependencies in both sub-directories:
```bash
# Frontend dependencies
cd client && npm install

# Backend dependencies
cd backend && npm install
```

### **System Execution**
To initiate the application in a development environment:
- **Backend API**: Navigate to the `/backend` directory and execute `npm run dev`. This utilizes `nodemon` and `concurrently` for real-time compilation.
- **Frontend Interface**: Navigate to the `/client` directory and execute `npm run dev` to start the execution of the Next.js development server.

---

## 🔍 Core Functionalities

### 1. User Interface Overview: Landing Page
Provides an optimized entry point with an integrated search utility for immediate access to listing datasets.
![Hero Section](./client/public/screenshots/hero.png)

### 2. Geospatial Property Discovery
An interactive search interface facilitates geographic exploration via coordinate-mapped markers.
![Search Page](./client/public/screenshots/search.png)

### 3. Detailed Property Analytics
Provides comprehensive data for individual listings, including verified status, high-resolution media galleries, and direct application submission vectors.
![Property Details](./client/public/screenshots/details.png)

### 4. Tenant Dashboard & State Management
Allows tenants to manage saved listings. The application utilizes targeted cache invalidation to ensure real-time UI updates upon state changes.
![Favorites Page](./client/public/screenshots/favorites.png)

### 5. Application Lifecycle Management
A structured system for tracking the lifecycle of rental applications, allowing for status monitoring and document retrieval post-approval.
![Applications Page](./client/public/screenshots/applications.png)

### 6. Managerial Oversight Interface
Allows property managers to evaluate incoming applications with specific status handlers that trigger state updates in the associated database tables.
![Manager Applications](./client/public/screenshots/manager-applications.png)

### 7. Property Ingestion System
A comprehensive data-entry module for listing new inventory, supporting multi-file uploads and complex relational data (e.g., fee structures).
![New Property Form](./client/public/screenshots/new-property.png)

---

## 🛠 Prerequisites & Asset Setup
To maintain the visual integrity of this documentation, ensure that screenshots are persisted in the `/client/public/screenshots/` directory with the following naming convention:
`hero.png`, `search.png`, `details.png`, `favorites.png`, `applications.png`, `manager-applications.png`, and `new-property.png`.
