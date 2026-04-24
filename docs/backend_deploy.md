# Deploying a FastAPI Backend  
### via ngrok Tunnel (Local Setup)

**Non-Dockerised • Study Rooms Backend • Free ngrok Account**

---

## 1. Prerequisites

Before you begin, make sure you have the following installed:

- Python 3.9+
- pip (Python package manager)
- An ngrok account (free tier is fine): https://ngrok.com

---

## 2. Project Structure

The backend project is structured as follows:

```
backend/
├── main.py              # FastAPI app entry point
├── config.py            # App configuration
├── db.py                # Database setup
├── requirements.txt
├── models/              # SQLAlchemy / Pydantic models
│   ├── buildings.py
│   ├── rooms.py
│   ├── room_blocks.py
│   └── users.py
├── routes/              # API route handlers
│   ├── auth.py
│   ├── buildings.py
│   ├── rooms.py
│   ├── room_blocks.py
│   ├── raspberrypi.py
│   └── users.py
├── utils/
│   └── auth.py          # Auth utilities
└── tests/               # Test suite
```

`main.py` is the FastAPI application entry point. The app is organized into models, routes, and utils packages, with a SQLite database (`study_rooms.db`).

---

## 3. Install Dependencies

Navigate to the project directory and install packages:

```bash
cd backend
pip install -r requirements.txt
```

If you encounter:

```
error: externally-managed-environment
```

Use a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate      # Linux/macOS
# venv\Scripts\activate    # Windows

pip install -r requirements.txt
```

Ensure `requirements.txt` includes at least:

```
fastapi
uvicorn[standard]
```

---

## 4. Run FastAPI Locally

Start the server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- Runs at: http://localhost:8000  
- Swagger UI: http://localhost:8000/docs  
- `--reload` auto-refreshes on code changes  

> ⚠️ Note: Replace `main:app` if your app entry point differs.

---

## 5. Install & Set Up ngrok

### 5.1 Install ngrok

```bash
# macOS
brew install ngrok

# Linux
sudo snap install ngrok

# Windows
choco install ngrok
```

---

### 5.2 Authenticate ngrok

1. Go to: https://dashboard.ngrok.com  
2. Copy your **authtoken**  
3. Run:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

---

## 6. Expose Local Server via ngrok

Make sure FastAPI is running on port 8000.

Then:

```bash
ngrok http 8000
```

Example output:

```
Forwarding https://abc123.ngrok-free.app -> http://localhost:8000
```

Use this URL to access your API publicly.

Swagger:

```
https://your-url.ngrok-free.app/docs
```

> ⚠️ Free plan: URL changes every restart.

---

## 7. Using a Reserved Domain (Free Account)

### 7.1 Claim Static Domain

1. Go to: https://dashboard.ngrok.com  
2. Navigate to **Domains**  
3. Click **New Domain**  
4. You’ll get:

```
your-name.ngrok-free.app
```

---

### 7.2 Use Reserved Domain

```bash
ngrok http 8000 --url your-name.ngrok-free.app
```

Now your URL stays consistent.

> ⚠️ Free plan allows **one** static domain.

---

## 8. Practical Tips

### Keep Both Processes Running

You need two terminals:

```
Terminal 1 → FastAPI (uvicorn)
Terminal 2 → ngrok
```

---

### ngrok Browser Warning

Browser users see a warning page.

To bypass in API calls:

```
Header: ngrok-skip-browser-warning: any-value
```

---

### CORS Configuration

If using a frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Quick-Start Cheat Sheet

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — ngrok
ngrok http 8000 --url your-name.ngrok-free.app
```

---

## End of Guide
