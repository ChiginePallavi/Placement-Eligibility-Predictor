# Placement Eligibility Predictor

A Full-Stack MERN application for tracking placement eligibility, managing opportunities, and providing secure authentication using **JSON Web Tokens (JWT)**, **bcrypt password hashing**, **Role-Based Access Control (RBAC)**, and **Render Backend Deployment Preparation**.

---

## 🌟 Key Features & Mandatory Modules

### 🔐 1. Secure Authentication & JWT Tokens
- **Password Verification**: Passwords hashed securely using `bcrypt` (10 salt rounds).
- **JWT Token Generation**: Returns signed JWT tokens upon login (`POST /api/auth/register` & `POST /api/auth/login`) configured with `JWT_SECRET` and expiration (`JWT_EXPIRES_IN=7d`).
- **Axios Interceptors**: Automatically attaches `Authorization: Bearer <token>` to outbound requests and handles 401 Unauthorized errors by resetting the session.

### 🛡️ 2. Role-Based Authorization (RBAC)
- **Roles Supported**: `admin` and `student`.
- **Backend Protection**: Middleware (`protect` & `authorizeRoles('admin')`) enforces role limits on mutation endpoints (`POST`, `PUT`, `DELETE` `/api/opportunities`).
- **Frontend UI Adaptation**:
  - **Admin Users**: Full control over opportunity creation, editing, deletion, and JSON export/import.
  - **Student Users**: Read-only access to placement listings with detailed view capabilities.

### 🚀 3. Protected Routes & Session Management
- **React Protected Routes**: Restricts `/dashboard`, `/details/:id`, and `/edit/:id` routes. Unauthenticated users are redirected to `/login`.
- **Automatic Session Restoration**: Auto-restores user session from JWT token on app reload.
- **Logout**: Clears `localStorage` JWT token and user details, safely redirecting to `/login`.

---

## 🔑 Test User Credentials

Run `npm run seed` in `backend` to initialize MongoDB with the following test accounts:

| Role | Email | Password | Access Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@placement.com` | `Admin@123` | Full CRUD on Opportunities & System Management |
| **Student** | `student@placement.com` | `Student@123` | Read-only Opportunities, View Details & Profile |

---

## 🌐 API Endpoints Overview

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Public: Register new account with optional profile image upload (Multer).
- `POST /api/auth/login` - Public: Authenticate user, return JWT token & user object.
- `GET /api/auth/me` - Protected: Fetch authenticated user profile.
- `PUT /api/auth/change-password` - Protected: Update user password securely.

### Opportunity Routes (`/api/opportunities`)
- `GET /api/opportunities` - Public/Authenticated: Get paginated & searchable opportunities.
- `GET /api/opportunities/search?name=tech` - Public/Authenticated: Search opportunities by title/company.
- `GET /api/opportunities/:id` - Public/Authenticated: Fetch single opportunity details.
- `POST /api/opportunities` - **Protected (Admin Only)**: Create new placement opportunity.
- `PUT /api/opportunities/:id` - **Protected (Admin Only)**: Update existing opportunity.
- `DELETE /api/opportunities/:id` - **Protected (Admin Only)**: Delete opportunity record.

---

## ☁️ Render Backend Deployment Guide

### Step 1: Push Repository to GitHub
Ensure all changes are committed and pushed to your GitHub repository.

### Step 2: Create Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `backend`.
5. Set Build Command: `npm install`
6. Set Start Command: `node server.js`

### Step 3: Configure Environment Variables on Render
Add the following Environment Variables under the **Environment** tab:

| Variable Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5050` | Port for Express server |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/Placementeligibility` | MongoDB Atlas URI |
| `JWT_SECRET` | `your_secure_jwt_secret_key_2026` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiration period |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` or `http://localhost:5173` | Allowed CORS Origin |

### Step 4: Connect Frontend to Render Backend
In your frontend project (e.g. Vercel / Netlify / local), set environment variable:
```env
VITE_API_URL=https://your-backend-app.onrender.com/api
```

---

## 🛠️ Local Development Setup

### Backend Setup:
```bash
cd backend
npm install
npm run seed  # Seeds initial opportunities and test users
npm run dev   # Starts backend server on http://localhost:5050
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev   # Starts Vite dev server on http://localhost:5173
```
