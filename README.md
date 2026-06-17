# Classroom Tracker (Node + Express + MySQL)

Quick starter for a minimal Node.js + Express app using MySQL.

Setup (Windows PowerShell):

1. Ensure Node.js and MySQL are installed on your machine. If not installed, install Node from https://nodejs.org/ and MySQL from https://dev.mysql.com/downloads/mysql/ or use Chocolatey: `choco install nodejs.install mysql`.

2. In PowerShell, run:

```powershell
cd "e:\projects\3-2\Classroom Tracker"
npm install
cp .env.example .env  # or copy the file in Explorer
# Edit .env to set DB credentials
```

3. Create the database and table (run in MySQL shell or a client):

```sql
CREATE DATABASE IF NOT EXISTS classroom_tracker;
USE classroom_tracker;
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Start the server:

```powershell
npm run dev
```

5. Endpoints:
- `GET /students` — list all students
- `GET /students/:id` — get a student
- `POST /students` — create, body: `{ "name": "Alice", "age": 10 }`
- `PUT /students/:id` — update
- `DELETE /students/:id` — delete

Troubleshooting:
- If `npm install` fails, verify Node/NPM are installed: `node -v` and `npm -v`.
- If the app can't connect to MySQL, check `.env` DB settings and that the MySQL server is running.
