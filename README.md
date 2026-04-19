# Task Manager

A full-stack task management application built with Spring Boot and React.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Spring Boot 3.5, Java 17 |
| Database | MySQL 8 |
| Auth | JWT via httpOnly cookies |
| Security | Spring Security, BCrypt |

## Features

- JWT authentication stored in httpOnly cookies (never exposed to JavaScript)
- Role-based access control (ADMIN / USER)
- Admins can create, assign, edit, and delete tasks
- Users can view their tasks, update status, and add comments
- User feedback/suggestion system with admin read receipts
- Admin dashboard with task management, user stats, and suggestions panel
- Real-time stats and overall progress bar on user dashboard
- Filter tasks by status (All / Pending / In Progress / Completed)
- Overdue task detection with visual highlighting
- Skeleton loading states and pagination on all panels
- Input validation on all endpoints (frontend + backend)
- Global exception handling with consistent error responses
- Database-level aggregations (no N+1 queries)
- Auto-cleanup of old read suggestions via scheduled job
- Docker support

## Project Structure

```
taskmanager/
├── Backend/                  Spring Boot application
│   └── src/main/java/com/example/taskmanager/
│       ├── config/           SecurityConfig
│       ├── controller/       AuthController, TaskController, AdminController, SuggestionController
│       ├── dto/              Request/Response DTOs
│       ├── entity/           User, TaskEntity, Suggestion
│       ├── enums/            Role, TaskStatus, Priority
│       ├── exception/        GlobalExceptionHandler
│       ├── repository/       JPA repositories
│       ├── security/         JWTUtil, JWTFilter
│       ├── service/          AuthService, TaskService, SuggestionService + impls
│       └── util/             AppConstants
├── Frontend/
│   └── Task_Management/      React + Vite application
│       └── src/
│           ├── api/          axiosInstance, constants
│           ├── components/
│           │   ├── admin/    AdminNavbar, TaskForm, TaskList, UserStatsTable, SuggestionList
│           │   └── ...       ConfirmModal, FeedbackModal, WelcomeTaskCard, ContactAdminWidget
│           ├── context/      AuthContext
│           ├── pages/        LoginPage, RegisterPage, DashboardPage, AdminPage
│           └── utils/        taskUtils
├── docker-compose.yml
└── README.md
```

## Getting Started

### Option A — Docker (recommended)

```bash
# Create a .env file at the project root first (see Environment Variables below)
docker-compose up --build
```

- Backend: `http://localhost:8080`
- Frontend: run separately (see Option B)

### Option B — Manual

**Prerequisites:** Java 17+, Node.js 18+, MySQL 8

**Backend:**

```bash
# Copy the example config and fill in your credentials
cp Backend/src/main/resources/application-dev.properties.example \
   Backend/src/main/resources/application-dev.properties

cd Backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui/index.html`

**Frontend:**

```bash
# Copy the example env and fill in your values
cp Frontend/Task_Management/.env.example \
   Frontend/Task_Management/.env.development

cd Frontend/Task_Management
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## API Reference

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login, sets httpOnly cookie |
| POST | /api/auth/logout | Public | Clears auth cookie |
| GET | /api/auth/me | Public | Verify current session |
| GET | /api/tasks | USER, ADMIN | Get paginated tasks |
| GET | /api/tasks/stats | USER, ADMIN | Get task count stats |
| POST | /api/tasks | ADMIN | Create a task |
| GET | /api/tasks/{id} | ADMIN | Get task by ID |
| PUT | /api/tasks/{id} | ADMIN | Update a task |
| DELETE | /api/tasks/{id} | ADMIN | Delete a task |
| PATCH | /api/tasks/{id}/status | USER, ADMIN | Update task status |
| PATCH | /api/tasks/{id}/comment | USER | Add a comment |
| GET | /api/admin/users | ADMIN | List users with pending count |
| GET | /api/admin/users/stats | ADMIN | Full user task statistics |
| POST | /api/suggestions | USER, ADMIN | Submit a suggestion |
| GET | /api/suggestions | ADMIN | Get all suggestions |
| GET | /api/suggestions/receipt | USER | Check if suggestion was read |
| PATCH | /api/suggestions/{id}/read | ADMIN | Mark suggestion as read |

## Environment Variables

| Variable | Description |
|---|---|
| DB_URL | JDBC connection URL |
| DB_USERNAME | Database username |
| DB_PASSWORD | Database password |
| JWT_SECRET | HMAC-SHA256 secret (min 32 chars) |
| CORS_ALLOWED_ORIGIN | Frontend origin (e.g. https://yourapp.vercel.app) |

## Roles

| Role | Permissions |
|---|---|
| ROLE_ADMIN | Full access — create, assign, update, delete tasks, view all users, stats, and suggestions |
| ROLE_USER | View own tasks, update status, add comments, submit feedback |

## Deployment Notes

When deploying to HTTPS (e.g. Render + Vercel), set `COOKIE_SECURE=true` and update `AuthController.java`:
```java
.secure(true)
.sameSite("None")   // required for cross-origin cookies
```

Set `CORS_ALLOWED_ORIGIN` to your Vercel frontend URL.
