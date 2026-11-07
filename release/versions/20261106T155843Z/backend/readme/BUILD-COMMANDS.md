<h1 align="center">
    <img src="static/images/gdx/gdx-logo-light.svg" alt="GDX Admin Portal" width="100%px" height="75" title="GDX Admin Portal"/>
</h1>

<p align="center">
  <img src="static/images/readme/login%403x.png" width="800" style="border-radius: 12px;"/>
</p>

<p align="center">Built With <br>
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=fff" width="88">
<img src="https://img.shields.io/badge/HTML-%23E34F26?style=for-the-badge&logo=html5&logoColor=white" width="72">
<img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" width="112">
<img src="https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white" width="86">
<img src="https://img.shields.io/badge/AWS-%23FF9900?style=for-the-badge&logo=amazon-web-services&logoColor=white" width="65">
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=fff" width="86">
<img src="https://img.shields.io/badge/Postgres-%23316192?style=for-the-badge&logo=postgresql&logoColor=white" width="100">
</p>
<p align="center">These are the essential commands to build the Global Data Marketplace Application.</p>

<h3 align="center">PYTHON COMMANDS</h3>
<p align="center"><strong>CREATE SUPERUSER:</strong> python3 manage.py createsuperuser</p>
<p align="center"><strong>RUN SERVER:</strong> python3 manage.py runserver</p>
<p align="center"><strong>CREATE MIGRATIONS:</strong> python manage.py shell</p>
<p align="center"><strong>MIGRATE:</strong> python3 manage.py migrate</p>
<p align="center"><strong>COLLECT STATIC FILES:</strong> python3 manage.py collectstatic</p>


<h3 align="center">PYTHON AUTOMATION & TEST COMMANDS</h3>
<p align="center"><strong>RUN TESTS:</strong> python3 manage.py test</p>
<p align="center"><strong>RUN TESTS WITH COVERAGE:</strong> python3 manage.py test --with-coverage</p>
<p align="center"><strong>CHECK PROBLEMS:</strong> python3 manage.py check</p>
<p align="center"><strong>CHECK PROBLEMS WITH CODES:</strong> python3 manage.py check --code</p>
<p align="center"><strong>CHECK PROBLEMS WITH CODES AND STYLE:</strong> python3 manage.py check --code --style</p>
<p align="center"><strong>CHECK PROBLEMS WITH CODES AND STYLE AND DOCUMENTATION:</strong> python3 manage.py check --code --style --docstring</p>
<p align="center"><strong>CHECK PROBLEMS WITH CODES AND STYLE AND DOCUMENTATION AND SECURITY:</strong> python3 manage.py check --code --style --docstring --security</p>
<p align="center"><strong>CHECK PROBLEMS WITH CODES AND STYLE AND DOCUMENTATION AND SECURITY AND PERFORMANCE:</strong> python3 manage.py check --code --style --docstring --security --performance</p>


# GDX Marketplace Build & Deployment Guide

This document outlines the commands and processes for deploying the GDX application across different environments.

## 🚀 Environment-Based Deployment

The project uses Docker Compose to manage environments. You can deploy to any environment using the helper script or manual docker commands.

### Option 1: Using the Deployment Script
The `run-local.sh` script is a wrapper that handles the file selection for you.
Note: Ensure you have given execution permissions to the script first: chmod +x run-local.sh.

| Environment | Command |
| :--- | :--- |
| **Local** | `./run-local.sh local` |
| **Demo** | `./run-local.sh demo` |
| **Dev** | `./run-local.sh dev` |
| **QA** | `./run-local.sh qa` |
| **Stage** | `./run-local.sh stage` |
| **Production** | `./run-local.sh prod` |

### Option 2: Manual Docker Commands
If you prefer running commands manually, use the `-f` flag to specify the config:

# Example for Stage environment
docker-compose -f docker-compose.stage.yml up --build -d

## 🛠️ Step-by-Step Deployment Lifecycle

When you trigger a deployment (e.g., `./run-local.sh dev`), the following sequence occurs:

1.  **Environment Selection**: The script identifies the target environment and loads the relevant `.env.<env>` secrets.
2.  **Container Orchestration**:
    -   **Database (db)**: A PostgreSQL container is initialized and configured with environment variables.
    -   **Backend**: The `backend/Dockerfile` builds a Python 3.12-slim image, installs `requirements.txt`, and sets the `DJANGO_SETTINGS_MODULE`.
    -   **Frontend**: The frontend is built and served (typically on port 4200 or via Nginx).
    -   **Worker/Celery**: Background task processors start handling SQS queues and async tasks.
3.  **Networking**: A private network is created where services communicate via service names (e.g., `db:5432`).
4.  **Static Files**: The system prepares to serve assets via `collectstatic`.
5.  **Health Checks**: The backend waits for the database to be ready before accepting requests on port 8000.

---

## 🐍 Management Commands (Inside Docker)

Once containers are running, perform administrative tasks using `docker-compose exec`:

| Task | Command |
| :--- | :--- |
| **Run Migrations** | `docker-compose exec backend python manage.py migrate` |
| **Create Superuser** | `docker-compose exec backend python manage.py createsuperuser` |
| **Collect Static** | `docker-compose exec backend python manage.py collectstatic --noinput` |
| **Run Tests** | `docker-compose exec backend python manage.py test` |

---

## 💻 Local Development (Non-Docker)

If you prefer to run the application outside of Docker:

-   **Install Dependencies**: `pip install -r backend/requirements.txt`
-   **Run Server**: `python backend/manage.py runserver`
-   **Migrations**: `python backend/manage.py makemigrations` followed by `python backend/manage.py migrate`.

---

## ⚠️ Security & Best Practices

> [!IMPORTANT]
> **Production**: Never use `runserver`. The production image is configured to use **Gunicorn** with 3 workers for scaling and stability.
>
> **Environment Variables**: Sensitive keys (AWS, DB Passwords) are stored in `.env.<env>` files. **Never commit these to version control.**
>
> **Build Phase**: Docker layers the Python environment to ensure consistency across all six deployment stages (Local, Demo, Dev, QA, Stage, and Prod).