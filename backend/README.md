# ATLAS Backend Service

FastAPI-powered backend service for the ATLAS Career Architecture Platform.

---

## 1. Prerequisites

- Python 3.10+ installed
- Virtual environment created in `backend/venv`

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

```powershell
Copy-Item .env.example .env
```

Configure the environment variables in `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

> **Security Note:** `SUPABASE_SERVICE_ROLE_KEY` is exclusively for backend administrative usage and is never exposed to the frontend or in API responses.

---

## 3. Installation & Dependencies

Install the required Python dependencies:

```powershell
venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

## 4. Running the Development Server (Windows PowerShell)

Run Uvicorn directly via the virtual environment's Python executable without needing PowerShell script activation:

```powershell
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **Base URL:** `http://localhost:8000`
- **Interactive OpenAPI Documentation (Swagger):** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

---

## 5. API Endpoints

### Root
- **`GET /`**
  - Response: `{"message": "ATLAS API is running"}`

### Health Check
- **`GET /api/health`**
  - Response: `{"status": "ok", "service": "ATLAS API"}`

### Candidate Profiles

#### Test Endpoint (Public)
- **`GET /api/profile/test`**
  - Response: `{"status": "ok", "message": "Profile API is ready"}`

#### Create or Update Profile (Authenticated)
- **`POST /api/profile`**
  - Headers: `Authorization: Bearer <SUPABASE_AUTH_JWT>`
  - Request Body:
    ```json
    {
      "full_name": "Rahul Sharma",
      "email": "rahul@example.com",
      "college": "State University",
      "degree": "B.Tech Computer Science",
      "year": "3rd Year",
      "experience_level": "Fresher",
      "target_role": "Data Analyst",
      "custom_role": null,
      "availability_hours_per_week": 10,
      "has_completed_setup": true
    }
    ```
  - Response (HTTP 200): Returns the created/updated `ProfileResponse` record.

#### Get Profile (Authenticated)
- **`GET /api/profile`**
  - Headers: `Authorization: Bearer <SUPABASE_AUTH_JWT>`
  - Response (HTTP 200): Returns the candidate's `ProfileResponse` record.
  - Response (HTTP 404): `{"detail": "Candidate profile not found."}` if no profile exists for this user.

---

## 6. Project Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app & middleware orchestration
│   ├── config.py               # Pydantic Settings & environment variables
│   ├── database.py             # Supabase client singleton
│   ├── dependencies/
│   │   ├── __init__.py
│   │   └── auth.py             # Bearer JWT auth verification dependency
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py           # /api/health endpoint
│   │   └── profiles.py         # /api/profile/* endpoints
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── profile.py          # ProfileCreate, ProfileResponse schemas
│   └── services/
│       ├── __init__.py
│       └── profile_service.py    # Database upsert/retrieval operations
├── database/
│   └── schema.sql              # Supabase PostgreSQL database schema
├── requirements.txt
├── .env.example
└── README.md
```
