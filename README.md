# CS308 Online Store Setup Guide- Group 24

This README explains how to set up and run the project locally for development.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Spring Boot 3.5.12
- **Database:** PostgreSQL 17
- **Language:** Java 21

---

## Prerequisites

Make sure you have the following installed on your machine before starting:

| Tool | Version | Check Command |
|------|---------|---------------|
| Java JDK | 21 | `java -version` |
| Node.js | LTS (22.x) | `node -v` |
| npm | comes with Node | `npm -v` |
| PostgreSQL | 17.x | `psql --version` |
| Git | latest | `git --version` |

### macOS Installation (via Homebrew)

If you still don't have Homebrew, install it first:

Then install the tools:

```bash
brew install openjdk@21
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

brew install node@22

brew install postgresql@17
brew services start postgresql@17
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Windows Installation

1. **Java JDK 21:** Download from [Adoptium](https://adoptium.net/) → Run installer → Make sure "Set JAVA_HOME" is checked.
2. **Node.js:** Download LTS from [nodejs.org](https://nodejs.org/) → Run installer.
3. **PostgreSQL:** Download from [postgresql.org](https://www.postgresql.org/download/windows/) → Run installer → Remember the password you set during installation.
4. **Git:** Download from [git-scm.com](https://git-scm.com/) → Run installer with default settings.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/zaroonshahschool/CS308-Project-G24.git
cd CS308-Project-G24
```

If prompted for credentials, use your GitHub username and a [Personal Access Token](https://github.com/settings/tokens) as the password.

### 2. Create the Database

**macOS:**

```bash
createdb mystore
```

**Windows (using psql shell):**

```sql
CREATE DATABASE mystore;
```

### 3. Configure Database Connection

Open `backend/src/main/resources/application.properties` and update the username and password to match **your** PostgreSQL setup:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mystore
spring.datasource.username=YOUR_POSTGRESQL_USERNAME
spring.datasource.password=YOUR_POSTGRESQL_PASSWORD
```

- **macOS (Homebrew):** Username is your macOS username (run `whoami` to check), password is empty.
- **Windows:** Username is usually `postgres`, password is what you set during PostgreSQL installation.

> ⚠️ **Do NOT commit your personal database credentials.** This file will be improved with environment variables later.

### 4. Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows, use:

```bash
mvnw.cmd spring-boot:run
```

Wait until you see `Started StoreApplication` in the terminal. The backend runs on **http://localhost:8080**.

### 5. Run the Frontend

Open a **new terminal window** (keep backend running in the first one):

```bash
cd frontend
npm install
npm run dev
```

`npm install` is only needed the first time or when `package.json` changes. The frontend runs on **http://localhost:5173**.

---

## IDEs

- **Backend:** IntelliJ IDEA (Ultimate recommended — free with [JetBrains student license](https://www.jetbrains.com/community/education/))
  - Open → Select the `backend` folder → IntelliJ will auto-detect Maven
- **Frontend:** VS Code
  - Open → Select the `frontend` folder
  - Recommended extensions: ES7+ React snippets, Prettier, ESLint

---

## Git Workflow

We use a **branch-based workflow**. The `main` branch should always contain stable, working code.

### Before You Start Working

```bash
git checkout main
git pull
git checkout -b feature/your-feature-name
```

### When You're Done

```bash
git add .
git commit -m "Descriptive commit message"
git push -u origin feature/your-feature-name
```

Then open a **Pull Request** on GitHub to merge into `main`.

### Important Rules

- **Never push directly to `main`.**
- Write clear commit messages.
- Pull latest changes from `main` before starting new work.
- Minimum **5 commits per person per demo** is required for grading.

---

## Project Structure

```
CS308-Project-G24/
├── backend/                  # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/        # Java source code
│   │   │   └── resources/   # Config files (application.properties)
│   │   └── test/             # Unit tests
│   └── pom.xml              # Maven dependencies
├── frontend/                 # React application (Vite)
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json         # npm dependencies
│   └── vite.config.js       # Vite configuration
├── .gitignore
└── README.md
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `cd backend && ./mvnw spring-boot:run` |
| Start frontend | `cd frontend && npm run dev` |
| Install frontend deps | `cd frontend && npm install` |
| Create new branch | `git checkout -b feature/name` |
| Push branch | `git push -u origin feature/name` |
| Switch to main | `git checkout main` |
| Pull latest | `git pull` |
