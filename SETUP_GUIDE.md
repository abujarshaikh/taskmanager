# Task Manager — Local Setup Guide

A step-by-step guide to run the Task Manager app on your machine.

---

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| Java | 17+ | https://adoptium.net |
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8 | https://dev.mysql.com/downloads/installer |
| Git | Latest | https://git-scm.com |

---

## Step 1 — Clone the Project

Open a terminal and run:

```bash
git clone https://github.com/abujarshaikh/taskmanager.git
cd taskmanager
```

---

## Step 2 — Setup Backend

Navigate to the resources folder:

```
Backend/src/main/resources/
```

Create a new file called:

```
application-dev.properties
```

Paste the following content and replace `YOUR_MYSQL_PASSWORD` with your own MySQL root password:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/task_manager?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.hibernate.ddl-auto=update
jwt.secret=any_random_string_minimum_32_characters_long
cors.allowed-origin=http://localhost:5173
cookie.secure=false
spring.jpa.show-sql=true
logging.level.com.example.taskmanager=DEBUG
logging.level.org.springframework=INFO
```

Now run the backend from the Backend folder:

**Windows:**
```bash
cd taskmanager\Backend
mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Mac / Linux:**
```bash
cd taskmanager/Backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Wait until you see this in the terminal:

```
Started TaskManagerApplication in X seconds
```

Backend is now running at: http://localhost:8080

---

## Step 3 — Setup Frontend

Open a NEW terminal window (keep the backend running).

Navigate to the frontend folder:

```bash
cd taskmanager/Frontend/Task_Management
```

Create a new file called:

```
.env.development
```

Paste the following content:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ADMIN_EMAIL=any@email.com
VITE_ADMIN_PHONE=911234567890
```

Now install dependencies and start the frontend:

```bash
npm install
npm run dev
```

Frontend is now running at: http://localhost:5173

---

## Step 4 — Open the App

Open your browser and go to:

```
http://localhost:5173
```

- Register a new account
- Tell the admin (Abujar) your username
- The admin will assign tasks to your account
- Refresh your dashboard to see your tasks

---

## Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `Access denied for user 'root'` | Wrong MySQL password | Update password in `application-dev.properties` |
| `Port 8080 already in use` | Another app using port 8080 | Close the other app or restart your machine |
| `Port 5173 already in use` | Another Vite app running | Close it or run `npm run dev -- --port 5174` |
| `npm not found` | Node.js not installed | Install from https://nodejs.org |
| `mvnw not recognized` | Wrong command for your OS | Use `./mvnw` on Mac/Linux, `mvnw` on Windows |
| `Table doesn't exist` | Schema not created | Make sure `ddl-auto=update` is in your properties file |
| `Unknown database` | MySQL database missing | Add `?createDatabaseIfNotExist=true` to the datasource URL |
| `Connection refused` | MySQL not running | Start MySQL service on your machine |

---

## Project Structure (for reference)

```
taskmanager/
├── Backend/                  Spring Boot API
├── Frontend/
│   └── Task_Management/      React frontend
├── docker-compose.yml        Docker setup
└── README.md                 Full documentation
```

---

## Need Help?

If you get stuck, send the exact error message to Abujar and he'll help you fix it.

GitHub: https://github.com/abujarshaikh/taskmanager
