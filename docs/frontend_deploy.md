## **Deploying a Frontend via Vercel (Local Setup)**



**Note: If ngrok fails to work (e.g. does not load rooms, buildings, etc.) go to the "Set Up Cloudflare" section**


### **1\. Prerequisites**

Before you begin, make sure you have the following installed on your machine:
- Node.js 3.9+
- npm (Node.js package manager)
- A Vercel account (free tier is fine) - [https://vercel.com](https://vercel.com/)

Also, ensure the frontend runs:
- cd study-room-mobile
- npx expo start
If the frontend does not work locally, it must be fixed before moving on.

### **2\. Workflow Visualization**

The workflow for the front and back ends are as follows:
- Frontend (Vercel)
- ↓
- Ngrok public URL
- ↓
- Your machine (FastAPI backend)

### **3\. Set Up Vercel**

Create a .env file in the root of study-room-mobile. In this .env file, add the following (don't forget to append "/api/v1" to the end of the URL):
- EXPO_PUBLIC_API_BASE_URL = <https://your-ngrok-url/api/v1>"

Restart the front end:
- npx expo start -c

In Vercel, create an account, navigate to the projects tab, and import the study-room-mobile repository. Set the project name, set the root directory to study-room-mobile, and the application preset to Other.

Under "Build and Output Settings", set the build command to:
- npx expo export --platform web

Still under "Build and Output Settings", set the output directory to:
- Ddist

Then, set the install command to:
- npm install

Lastly, under Environment Variables, add the environment variable from your .env file:
- EXPO_PUBLIC_API_URL=<https://YOUR-NGROK-URL.ngrok-free.dev/api/v1>

Scroll down and click Deploy. After building and deployment completes, you will be prompted to view your deployment from the dashboard. Under the Overview tab, you should see your production deployment, along with the status and deployment settings. You should also see the project URL under Domains in the Production Deployment container. This will be your public URL for the frontend.

### **4\. Set Up Cloudflare**

In a new terminal, start the backend:
- cd ~/dmps/backend
- uvicorn main:app -host 0.0.0.0 --port 8000 -reload

Test it with the following. It should return the message "Study Room Management API":
- curl <http://localhost:8000>

In a new terminal, start the Cloudflare tunnel:
- cloudflared tunnel --url <http://localhost:8000>

Look for your new URL:
- htps://randomly-generated-url.trycloudflare.com

Test this new URL with curl, just as you did for the localhost. You should encounter the same API message.

In a new terminal, start the backend:
- cd ~/dmps/backend
- uvicorn main:app -host 0.0.0.0 --port 8000 --reload

In Vercel, set the environment variable to your new Cloudflare URL with "/api/v1" appended to the end of the link (follow same steps as ngrok setup). Now redeploy your project. Upon building and deploying, you will see your new frontend public URL.