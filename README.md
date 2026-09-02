# Movie Ticket Booking System

Full-stack movie ticket booking project with React/Vite frontend, Express/Node.js backend and MySQL database.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Backend

```bash
cd backend
npm install
npm run dev
```

Backend: http://localhost:5000

The backend creates the admin account from `backend/.env` on startup if it does not already exist.

Default local admin credentials:

- Email: `admin@gmail.com`
- Password: `admin@1234`

Change these values in `backend/.env` before using the project outside local development.

## Database

Run `database/database.sql` in MySQL first. The backend reads its database settings from `backend/.env`.

## Main API routes

- `POST /api/auth/register` - customer registration
- `POST /api/auth/login` - login and JWT creation
- `POST /api/auth/logout` - logout response
- `GET /api/movies` - active movies, with optional `search`, `genre`, and `language`
- `GET /api/movies/:id` - movie details
- `GET /api/bookings/my` - logged-in user's bookings
- `GET /api/bookings/all` - admin-only booking list
- `GET /api/admin/dashboard` - admin-only dashboard statistics

## Frontend pages

- `/login`
- `/register`
- `/home`
- `/my-bookings`
- `/admin-dashboard` (admin only)

## Logo

The single shared logo is stored at:

```text
frontend/src/pictures/logo.png
```

Login, Register, Home, My Bookings and Admin Dashboard all import this same image.

## Navigation

After login:

- Customers go to Home.
- Admin users go to Admin Dashboard.
- The Home navbar shows a circular profile avatar containing the first letter of the logged-in user's name.
- The profile menu contains the user's name/email and links to My Bookings; admins also get Admin Dashboard.
