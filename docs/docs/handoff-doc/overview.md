# System at a glance

Below are the frontend and backend tech stacks of the **Clark Street Bird Sanctuary Plant Tracker Website**, as well as the key directories for each of the repositories.

### Frontend

| Tool       | Purpose                |
| --------------- | -----------------------|
| React           | UI components          |
| React Router v7 | Navigation Across Pages|
| Tailwind        | Styling components     |
| Supabase        | Authentication         |
| Leaflet         | Map interface          |
| AG Grid         | Data grid/ spreadsheet  |
| Docusaurus      | Documentation          |

### Backend
| Framework       | Purpose                       |
| --------------- | ------------------------------|
| Node.js, Express| Server-side logic             |
| PostgreSQL      | Used via Supabase for database|
| ESLint, Prettier| Consistent code formatting    |

## Key directories

### Frontend (`apps/frontend/`)
```
src/
├── components/         → React components organized by feature
│   ├── map/           → Map interface components
│   ├── spreadsheet/   → Spreadsheet view components
│   ├── observations/  → Plant observation components
│   ├── admin/         → Admin dashboard components
│   ├── navigation/    → Navigation components
│   └── ui/            → Reusable UI components
├── pages/             → React Router page components
│   ├── MapView.tsx    → Main map interface page
│   ├── SpreadsheetView.tsx → Data management interface
│   ├── admin.tsx      → Admin dashboard page
│   └── account/       → User account pages
├── hooks/             → Custom React hooks
├── contexts/          → React context providers
├── layouts/           → Page layout components
├── utils/             → Helper functions and utilities
└── App.tsx            → Main application component

public/                → Static assets (index.html, images, etc.)
types/                 → TypeScript type definitions
tailwind.config.js     → Tailwind CSS configuration
vite.config.ts         → Vite build tool configuration
package.json           → Frontend dependencies and scripts
```

### Backend (`apps/backend/`)
```
routes/                → API endpoint handlers
├── authRoutes.ts      → Authentication endpoints
├── plantRoutes.ts     → Plant data management
├── obsRoutes.ts       → Observation endpoints
├── snapshotRoutes.ts  → Data snapshot endpoints
├── patchRoutes.ts     → Patch management endpoints
└── userRoutes.ts      → User management endpoints

controllers/           → Business logic controllers
middleware/            → Express middleware functions
config/                → Server configuration files
utilities/             → Backend utility functions
tests/                 → Backend test files
types.ts               → TypeScript type definitions
package.json           → Backend dependencies and scripts
```

## Decision Log
| Choice                         | Rationale                                                             |
| ------------------------------ | ----------------------------------------------------------------------|
| Chose **React** for frontend       | Standard modern framework with component reusability                  |
| Used **Tailwind** CSS              | Utility-first styling for fast prototyping and consistency            |
| Backend built with **Express.js**  | Lightweight, flexible Node.js framework                               |
|Chose **Supabase** for backend      | Open-source Firebase alternative; built-in auth and Postgres database |
| Adopted **Docusaurus** for docs	   | Built-in docs support, versioning, and quick setup                    |