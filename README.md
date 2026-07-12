# AssetFlow

AssetFlow is a full-stack asset and resource management platform built to help organizations track physical assets, manage allocations, handle resource bookings, process maintenance requests, and run audits from a single system.

It combines a React + Vite frontend with an Express + Prisma backend and supports role-aware workflows for administrators, asset managers, department heads, and employees.

---

## Overview

AssetFlow is designed for teams that need a practical internal operations dashboard for:

- managing an asset repository
- assigning and returning equipment to users
- booking shared resources without conflicts
- raising and tracking maintenance requests
- running audit cycles and verifying asset conditions
- organizing departments, categories, roles, and notifications
- reviewing operational insights and reporting data

---

## Core Features

### Authentication and Access Control
- Signup and login flows
- Password reset support
- Google sign-in support for development and testing
- Role-based access for ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, and EMPLOYEE

### Asset Management
- Create and view assets
- Assign asset tags and metadata
- Organize assets by department and category
- Track lifecycle states such as AVAILABLE, ALLOCATED, RESERVED, UNDER_MAINTENANCE, LOST, RETIRED, and DISPOSED

### Allocation Workflow
- Allocate assets to users or teams
- Track return dates and allocation status
- Monitor overdue or completed allocations
- Record notes and allocation history

### Booking System
- Create bookings for shared resources
- Prevent overlapping reservations on the same resource
- Track booking status across upcoming, ongoing, completed, and cancelled items

### Maintenance Management
- Create maintenance requests for assets
- Assign work to responsible users or technicians
- Track request priority and status transitions

### Audit Management
- Start and manage audit cycles
- Record verified, missing, or damaged items
- Maintain a structured audit trail

### Organization Setup
- Manage departments and categories
- Configure custom category fields
- Keep users organized by department and role

### Notifications and Analytics
- View user notifications
- Review operational analytics for assets, maintenance, and usage patterns

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Recharts, FullCalendar |
| Backend | Node.js, Express.js, Prisma ORM, PostgreSQL, JWT |
| Security | bcryptjs, Zod validation, cookie-based refresh token handling |

---

## Project Structure

```text
AssetFlow/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── prisma/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── lib/
│   ├── package.json
│   └── vite.config.js
├── package.json
└── README.md
```

---

## Prerequisites

Before running the project, ensure you have:

- Node.js 18 or newer
- npm installed
- PostgreSQL running locally or remotely
- A valid database connection string

---

## Environment Setup

Create a backend/.env file with values similar to the following:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/assetflow
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SEED_ADMIN_EMAIL=admin@assetflow.com
SEED_ADMIN_PASSWORD=AdminPassword123
```

> Update the values to match your local environment and database setup.

---

## Quick Start

### 1) Install dependencies

From the project root:

```bash
npm install
```

Then install backend and frontend dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Generate Prisma client and run migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

This populates example users, departments, categories, assets, and related records.

### 3) Run the app

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### 4) Health check

```bash
curl http://localhost:5000/api/health
```

---

## Main API Routes

The backend exposes routes under the /api base path.

### Authentication
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/google-login
- GET /api/auth/me

### Assets
- GET /api/assets
- POST /api/assets
- GET /api/assets/:id

### Allocations
- GET /api/allocations
- POST /api/allocations

### Bookings
- GET /api/bookings
- POST /api/bookings

### Maintenance
- GET /api/maintenance
- POST /api/maintenance

### Notifications
- GET /api/notifications
- POST /api/notifications/read-all

### Audits
- GET /api/audits
- POST /api/audits/start

### Organization Setup
- GET /api/org/departments
- POST /api/org/departments
- GET /api/org/categories
- POST /api/org/categories

---

## Notes for Developers

- The backend uses Prisma with PostgreSQL and relies on migrations for schema updates.
- Frontend UI flows are organized around reusable components and route-based pages.
- The project structure is modular and can be extended with deeper reporting, approvals, and integration features.

---

## License

This project is currently distributed under the ISC license.
