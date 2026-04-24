# Deploying a Frontend  
## via Vercel (Local Setup)

**Non-Dockerised • Study Rooms Frontend • Free Vercel Account**

---

> **Note:** If ngrok fails to work (e.g. does not load rooms, buildings, etc.), go to the **Set Up Cloudflare** section.

---

## **1. Prerequisites**

Before you begin, make sure you have the following installed on your machine:

- Node.js 3.9+
- npm (Node.js package manager)
- A Vercel account (free tier is fine)  
  https://vercel.com

Also, ensure the frontend runs:

```bash
cd study-room-mobile
npx expo start
```

If the frontend does not work locally, it must be fixed before moving on.

---

## **2. Workflow Visualization**

The workflow for the front and back ends are as follows:

Frontend (Vercel)  
↓  
Ngrok public URL  
↓  
Your machine (FastAPI backend)

---

## **3. Set Up Vercel**

Create a `.env` file in the root of `study-room-mobile`.

In this `.env` file, add the following  
(**don’t forget to append `/api/v1` to the end of the URL**):

```env
EXPO_PUBLIC_API_BASE_URL=https://your-ngrok-url/api/v1
```

Restart the frontend:

```bash
npx expo start -c
```

---

### Configure Vercel

1. Create a Vercel account  
2. Go to the **Projects** tab  
3. Import the `study-room-mobile` repository  

Set:
- Project Name → anything
- Root Directory → `study-room-mobile`
- Framework Preset → `Other`

---

### Build and Output Settings

Build Command:
```bash
npx expo export --platform web
```

Output Directory:
```bash
dist
```

Install Command:
```bash
npm install
```

---

### Environment Variables

```env
EXPO_PUBLIC_API_BASE_URL=https://YOUR-NGROK-URL.ngrok-free.dev/api/v1
```

---

### Deploy

Click Deploy and wait for build completion.

Your public frontend URL will appear under **Domains**.

---

## **4. Set Up Cloudflare (If ngrok fails)**

Start backend:

```bash
cd ~/dmps/backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Test backend:

```bash
curl http://localhost:8000
```

Expected response:
```
Study Room Management API
```

---

Start Cloudflare tunnel:

```bash
cloudflared tunnel --url http://localhost:8000
```

Example URL:
```
https://random-url.trycloudflare.com
```

Test:

```bash
curl https://random-url.trycloudflare.com
```

---

Update Vercel environment variable:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-cloudflare-url.trycloudflare.com/api/v1
```

Redeploy in Vercel.

---

## **Final Result**

Frontend (Vercel)  
↓  
Cloudflare Tunnel  
↓  
Local FastAPI Backend
