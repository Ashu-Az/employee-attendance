# HRMS Lite

A lightweight, full-stack Human Resource Management System for managing employee records and tracking daily attendance.

---

## Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React 18, React Router v6, Tailwind CSS, Lucide Icons |
| Backend    | Python 3, Django 4.2, Django REST Framework           |
| Database   | SQLite (local) / PostgreSQL (production)              |
| Deployment | Vercel (frontend), Render (backend)                   |

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── hrms_project/          # Django project package
│   │   ├── settings.py        # All Django settings
│   │   ├── urls.py            # Root URL config
│   │   ├── wsgi.py            # WSGI entry point for gunicorn
│   │   └── exceptions.py      # Custom DRF error-response normaliser
│   ├── employees/             # Django app – Employee model + API
│   │   ├── models.py
│   │   ├── serializers.py     # camelCase ↔ snake_case mapping
│   │   ├── views.py           # DRF ViewSet (list / create / destroy)
│   │   ├── urls.py
│   │   └── migrations/
│   ├── attendance/            # Django app – Attendance model + API
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py           # upsert logic + per-employee endpoint
│   │   ├── urls.py
│   │   └── migrations/
│   ├── manage.py
│   ├── requirements.txt
│   ├── start.sh               # Render start script
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

- Python 3.10 or higher
- Node.js 18 or higher & npm
- (No external database needed locally – Django uses SQLite by default)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file (or just leave the defaults – SQLite works out of the box):

```
SECRET_KEY=any-random-string
DEBUG=True
DATABASE_URL=                # leave empty for SQLite
```

```bash
python manage.py migrate     # creates db.sqlite3 + tables
python manage.py runserver   # starts on http://127.0.0.1:8000
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

```bash
npm run dev          # Vite dev server, usually http://localhost:5173
```

Open your browser and go to `http://localhost:5173`.

---

## Deploying

### Render (Backend)

1. Push the repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service**.
3. Connect your GitHub repo and set the **Root Directory** to `backend`.
4. **Runtime:** Python 3
5. **Build command:** `pip install -r requirements.txt`
6. **Start command:** `chmod +x start.sh && ./start.sh`
   - `start.sh` runs `python manage.py migrate` first, then launches gunicorn.
7. Environment variables to add:
   - `SECRET_KEY` — a random string (e.g. from `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `DATABASE_URL` — a PostgreSQL connection string (use Render's free PostgreSQL or [Neon](https://neon.tech) free tier)
   - `DEBUG` — set to `False`

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
- Locally the app uses SQLite (zero setup). For production on Render, set `DATABASE_URL` to a PostgreSQL instance so data persists across restarts.
