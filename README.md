# HRMS Lite

A lightweight, full-stack Human Resource Management System for managing employee records and tracking daily attendance.

---

## Tech Stack

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Frontend   | React 18, React Router v6, Tailwind CSS, Lucide Icons |
| Backend    | Node.js, Express.js                                 |
| Database   | MongoDB (Mongoose ODM)                              |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas  |

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── Employee.js        # Employee schema
│   │   └── Attendance.js      # Attendance schema (compound index on employeeId + date)
│   ├── routes/
│   │   ├── employees.js       # CRUD routes for employees
│   │   └── attendance.js      # Mark & query attendance
│   ├── server.js              # Express app entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Left navigation
│   │   │   ├── Loader.jsx         # Spinner / loading state
│   │   │   ├── Toast.jsx          # Success / error notification
│   │   │   ├── EmptyState.jsx     # Placeholder when no data
│   │   │   └── ConfirmModal.jsx   # Delete confirmation dialog
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Summary cards + recent attendance
│   │   │   ├── Employees.jsx      # Add / list / delete employees
│   │   │   └── Attendance.jsx     # Mark attendance + view history
│   │   ├── services/
│   │   │   └── api.js             # Axios wrappers for every endpoint
│   │   ├── App.jsx                # Router + layout
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind directives + scrollbar styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## API Endpoints

| Method | Endpoint                          | Description                              |
| ------ | --------------------------------- | ---------------------------------------- |
| GET    | `/api/health`                     | Server health check                      |
| GET    | `/api/employees`                  | List all employees                       |
| POST   | `/api/employees`                  | Create a new employee                    |
| DELETE | `/api/employees/:id`              | Delete employee + their attendance       |
| POST   | `/api/attendance`                 | Mark (or update) attendance for one day  |
| GET    | `/api/attendance/employee/:empId` | All attendance records for one employee  |
| GET    | `/api/attendance`                 | All records — supports `startDate` & `endDate` query params |

---

## Running Locally

### Prerequisites

- Node.js 18 or higher
- npm
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file (copy `.env.example` and fill in your values):

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hrms_lite?retryWrites=true&w=majority
PORT=5000
```

```bash
npm run dev          # starts with nodemon (auto-reload)
# or
npm start            # plain node (use this in production)
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev          # Vite dev server, usually http://localhost:5173
```

Open your browser and go to `http://localhost:5173`.

---

## Deploying

### MongoDB Atlas (Database)

1. Sign up at [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas).
2. Create a free-tier cluster.
3. Add `0.0.0.0/0` to the IP allowlist (or restrict to your deployment IPs).
4. Copy the connection string — you'll need it for the backend `.env`.

### Render (Backend)

1. Push the repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service**.
3. Connect your GitHub repo and set the **Root Directory** to `backend`.
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `PORT` — Render sets this automatically, but you can leave it blank

### Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repo and set the **Root Directory** to `frontend`.
3. Vercel detects Vite automatically — build command is `npm run build`, output is `dist`.
4. Add an environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://hrms-lite-backend.onrender.com/api`)
5. Deploy. Done.

---

## Features Implemented

### Core
- Add / list / delete employees with full validation
- Mark attendance (Present / Absent) for any employee on any date
- Server-side validation: required fields, email format, duplicate Employee ID
- Proper HTTP status codes and meaningful error messages
- Cascade delete: removing an employee also removes their attendance records

### Bonus
- **Dashboard summary** — total employees, present/absent today, recent attendance table
- **Filter attendance by date** — date picker on the attendance page
- **Present / Absent day counts** — shown per-employee when viewing their history

### UI
- Loading, empty, and error states on every page
- Toast notifications for success and failure
- Confirmation modal before deleting an employee
- Smooth animations on form appearance and toasts
- Responsive grid layout on the add-employee form

---

## Assumptions & Limitations

- Single admin user — no login or role-based access control.
- Leave management, payroll, and advanced HR features are out of scope.
- If attendance is marked twice for the same employee and date, the record is updated (not duplicated).
- MongoDB Atlas free tier is sufficient; no local MongoDB installation is needed.
