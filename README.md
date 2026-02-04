# HRMS Lite

A small full-stack HR app I built for managing employees and tracking their daily attendance. Nothing fancy — just the essentials, done properly.

## Live Demo

- **Frontend:** https://employee-attendance-pearl.vercel.app
- **Backend API:** https://employee-attendance-2wg3.onrender.com/api

---

## Why I picked this stack

I went with **React + Vite** on the frontend because Vite is just fast and I've used it enough to know it won't give me trouble. Tailwind for styling since I can move quick with utility classes and it keeps things looking clean without writing a ton of CSS. Lucide for icons, simple and lightweight.

For the backend I picked **Django + Django REST Framework**. DRF gives you serializers, routers, and viewsets out of the box so I don't have to wire up every little thing manually. It also handles validation nicely which saved me time.

Database-wise I use **SQLite locally** so anyone cloning the repo can just run it without setting up Postgres or anything. But in production I switch to **PostgreSQL on Neon** using an env variable — Django's `dj-database-url` makes that swap painless.

Deployed the backend on **Render** and frontend on **Vercel**. Both were pretty straightforward to set up.

| Layer      | Tech                                          |
| ---------- | --------------------------------------------- |
| Frontend   | React 18, React Router v6, Tailwind, Lucide  |
| Backend    | Python 3, Django 4.2, DRF                    |
| Database   | SQLite (local) / PostgreSQL via Neon (prod)  |
| Deployment | Vercel (frontend), Render (backend)          |

---

## How the project is structured

```
├── backend/
│   ├── hrms_project/          # Django project settings, urls, wsgi
│   │   └── exceptions.py      # custom error handler so the frontend always gets { message }
│   ├── employees/             # employee model, serializer, viewset
│   ├── attendance/            # attendance model, serializer, viewset with upsert logic
│   ├── manage.py
│   ├── requirements.txt
│   └── start.sh               # runs migrate then gunicorn on Render
│
├── frontend/
│   └── src/
│       ├── components/        # Sidebar, Loader, Toast, ConfirmModal, EmptyState
│       ├── context/           # DataContext — shared employee list so pages don't keep re-fetching
│       ├── pages/             # Dashboard, Employees, Attendance
│       ├── services/api.js    # all axios calls live here
│       └── App.jsx            # router + layout
│
└── README.md
```

I split the backend into two Django apps — `employees` and `attendance`. Felt cleaner than dumping everything into one app. Each one has its own models, serializers, views, and urls.

On the frontend I made a `DataContext` because I noticed every page was independently fetching the employee list when it mounted. That meant navigating Dashboard → Employees → Attendance would fire the same API call three times. The context fetches once and shares the list everywhere. Pages that need to refresh after a create or delete just call the `refresh()` function.

---

## API endpoints

| Method | Endpoint                          | What it does                                        |
| ------ | --------------------------------- | --------------------------------------------------- |
| GET    | `/api/health`                     | quick check that the server is up                   |
| GET    | `/api/employees`                  | list all employees                                  |
| POST   | `/api/employees`                  | add a new employee                                  |
| DELETE | `/api/employees/:id`              | delete an employee (attendance goes with them)      |
| POST   | `/api/attendance`                 | mark attendance — if a record already exists for that day it updates instead of duplicating |
| GET    | `/api/attendance/employee/:empId` | get all attendance records for one employee         |
| GET    | `/api/attendance`                 | get all records, can filter with `startDate` & `endDate` params |

The attendance upsert was something I thought about early on. If someone accidentally marks the same employee twice on the same day, it just updates the status instead of throwing an error or creating a duplicate. Felt like the right call for a daily attendance tool.

---

## Running it locally

You need Python 3.10+ and Node.js 18+ installed. No database setup needed for local dev.

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` (or just skip it, SQLite works without one):

```
SECRET_KEY=any-random-string
DEBUG=True
DATABASE_URL=
```

```bash
python manage.py migrate
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

```bash
npm run dev
```

Open `http://localhost:5173` and you're good.

---

## Deploying

**Render (backend):**

Push to GitHub, then go to Render → New Web Service. Point it at your repo, set root directory to `backend`.

- Runtime: Python 3
- Build: `pip install -r requirements.txt`
- Start: `chmod +x start.sh && ./start.sh`

The `start.sh` script runs migrations first then starts gunicorn. Add these env vars on Render:

- `SECRET_KEY` — generate one with `python -c "import secrets; print(secrets.token_hex(32))"`
- `DATABASE_URL` — your Neon or Render PostgreSQL connection string
- `DEBUG` — set to `False`

**Vercel (frontend):**

Go to Vercel → New Project, import the repo, set root to `frontend`. Vercel picks up Vite automatically. Just add one env var:

- `VITE_API_URL` — your Render backend URL like `https://your-app.onrender.com/api`

Hit deploy and that's it.

---

## What I built and why

**Employee management** — add, list, delete. Each employee has an ID, name, email, and department. The ID has to be unique, I validate that on both the frontend and backend. If someone tries to create a duplicate the backend returns a 409 and shows the error right on the form.

**Attendance** — pick an employee, pick a date, mark them Present or Absent. Their history shows up below with a count of present and absent days. I also added filters — you can filter by date and by status.

**Dashboard** — I added this as a landing page so it's not just empty when you open the app. Shows total employees, who's present and absent today, and a table of recent attendance entries.

**Expandable employee rows** — clicking on an employee in the table expands it to show their details and full attendance history right there. Felt more useful than navigating to a separate page for something so simple.

**Validation** — on the employee form each field validates on blur, so you get instant feedback with a red border and error message as you fill things out. Not just at the end when you hit submit.

**Shared data context** — like I mentioned, I pulled the employee list into a React context so it only fetches once. No more redundant network calls when switching pages.

---

## A few things to keep in mind

- There's no login. The assignment said single admin user, no auth required, so I skipped it.
- Leave management, payroll, all that — out of scope, not built.
- Locally everything runs on SQLite. For production you need to set `DATABASE_URL` to a PostgreSQL instance or the data won't persist across Render restarts.
- If you mark attendance for the same employee on the same date twice, it updates the existing record. No duplicates.
