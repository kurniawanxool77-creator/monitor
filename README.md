# SIMPEL - Sistem Pengendalian Kegiatan

Fullstack application untuk pengendalian kegiatan dengan arsitektur modern.

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Data Fetching**: Axios
- **Routing**: React Router DOM v6

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: SQLite (via Prisma ORM)
- **ORM**: Prisma
- **Validation**: Joi
- **Authentication**: JWT (Access + Refresh Token)
- **Logging**: Morgan

## Project Structure

```
simpel/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── config/            # Configuration
│   │   │   ├── database.ts    # Prisma client
│   │   │   └── env.ts         # Environment variables
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   └── kegiatan.controller.ts
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.ts        # JWT authentication
│   │   │   ├── errorHandler.ts
│   │   │   └── validate.ts    # Joi validation
│   │   ├── routes/           # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── kegiatan.routes.ts
│   │   │   └── index.ts
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.ts
│   │   │   └── kegiatan.service.ts
│   │   ├── validations/       # Joi schemas
│   │   │   ├── auth.validation.ts
│   │   │   └── kegiatan.validation.ts
│   │   ├── utils/
│   │   │   └── logger.ts      # JSON logger
│   │   └── index.ts          # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios API clients
│   │   │   ├── axios.ts      # Axios instance
│   │   │   ├── auth.api.ts
│   │   │   └── kegiatan.api.ts
│   │   ├── components/       # React components
│   │   │   ├── common/       # Shared components
│   │   │   ├── layout/       # Layout components
│   │   │   └── pages/        # Page components
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── store/            # Redux store
│   │   │   └── slices/       # Redux slices
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

## Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed

# Start development server
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Default Credentials

| Role      | Email              | Password  |
|-----------|-------------------|-----------|
| Superadmin | admin@simpek.com  | admin123  |
| Admin     | operator@simpek.com | admin123 |

## API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/refresh-token` - Refresh token
- `GET /api/v1/auth/profile` - Get profile
- `PATCH /api/v1/auth/profile` - Update profile

### Kegiatan
- `GET /api/v1/kegiatan/bidang` - List bidang
- `POST /api/v1/kegiatan/bidang` - Create bidang
- `GET /api/v1/kegiatan/uraian` - List uraian
- `POST /api/v1/kegiatan/uraian` - Create uraian
- `GET /api/v1/kegiatan/sub-kegiatan` - List sub kegiatan
- `POST /api/v1/kegiatan/sub-kegiatan` - Create sub kegiatan
- `PATCH /api/v1/kegiatan/steps/:id` - Update step
- `GET /api/v1/kegiatan/realisasi` - List realizations
- `POST /api/v1/kegiatan/realisasi` - Create realization
- `GET /api/v1/kegiatan/anggaran/summary` - Budget summary
- `GET /api/v1/kegiatan/activity-logs` - Activity logs

## Features

- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access control (SUPERADMIN, ADMIN, USER)
- ✅ CRUD for Bidang, Uraian, Sub Kegiatan
- ✅ Step-based workflow management
- ✅ Budget tracking & realization
- ✅ Activity logging
- ✅ Input validation with Joi
- ✅ Error handling & logging
- ✅ CORS & Rate limiting
- ✅ Helmet security headers

## Development

```bash
# Backend
npm run dev        # Start dev server with hot reload
npm run build      # Build for production
npm run db:studio  # Open Prisma Studio

# Frontend
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```
