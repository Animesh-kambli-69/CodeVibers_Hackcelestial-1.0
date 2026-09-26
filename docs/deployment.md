# Deployment Guide: Smart Resort 360

This guide outlines how to deploy the entire microservice architecture for the hackathon.

## Architecture Map
1. **Frontend (Dashboard)** ➔ Vercel
2. **Booking Site (Public)** ➔ Vercel
3. **Backend (Node.js API)** ➔ Render.com
4. **ML Service (FastAPI)** ➔ AWS EC2 (Ubuntu)
5. **Database (PostgreSQL)** ➔ Neon.tech or Supabase

---

## 1. Deploying the React Frontends (Vercel)

Vercel is the easiest and fastest way to deploy React/Vite apps. You will deploy **two** separate projects on Vercel from the same GitHub repo.

### Steps:
1. Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. **For the Operations Dashboard (`frontend`):**
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Framework Preset**: Vite
   - **Environment Variables**: Add `VITE_USE_MOCKS=false` and `VITE_API_BASE_URL=https://your-backend-url.onrender.com` (you will update this URL later after deploying the backend).
   - Click **Deploy**.
4. **For the Booking Site (`booking-site`):**
   - Click Add New Project again, import the same repo.
   - **Root Directory**: Click "Edit" and select `booking-site`.
   - **Framework Preset**: Vite
   - **Environment Variables**: Add `VITE_API_BASE_URL=https://your-backend-url.onrender.com`.
   - Click **Deploy**.

---

## 2. Deploying the Node.js Backend (Render.com)

Render provides a free tier for Node.js Web Services that is perfect for hackathons.

### Steps:
1. Go to [Render.com](https://render.com/) and click **New > Web Service**.
2. Connect your GitHub repository.
3. **Configuration**:
   - **Name**: `smart-resort-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your PostgreSQL connection string (from Neon or Supabase).
   - `JWT_SECRET`: Any random long string (e.g., `hackathon_super_secret_key_123`).
   - `LLM_API_KEY`: Your Google Gemini API Key.
   - `CORS_ORIGIN`: `*` (or your two Vercel URLs separated by commas).
   - `ML_SERVICE_URL`: `http://<YOUR_EC2_IP>:8000/api/v1/ml` (you will get this IP in Step 3).
5. Click **Create Web Service**. 

*Note: Render free tier spins down after 15 minutes of inactivity. For your demo, make sure to visit the backend URL 2 minutes before presenting to wake it up!*

---

## 3. Deploying the ML Service (AWS EC2)

Because the ML service requires heavy Python libraries (`scikit-learn`, `xgboost`, `pandas`), it is best deployed on a dedicated EC2 instance. We have provided a `Dockerfile` in the `ml-service` folder to make this foolproof.

### Step 3A: Launch the EC2 Instance
1. Go to your AWS Console > EC2 > **Launch Instance**.
2. **Name**: `smart-resort-ml`
3. **OS**: Ubuntu 22.04 LTS or 24.04 LTS.
4. **Instance Type**: `t2.micro` or `t3.micro` (Free Tier eligible).
5. **Key Pair**: Create a new key pair (download the `.pem` file to your Windows machine).
6. **Network Settings**: 
   - Allow SSH traffic (Port 22).
   - **CRITICAL:** Click Edit Security Groups and add a Custom TCP Rule for **Port 8000** (Anywhere `0.0.0.0/0`).

### Step 3B: Connect and Run (Windows Instructions)
1. Open Windows Terminal (PowerShell).
2. Connect to your instance using the `.pem` key:
   ```bash
   ssh -i "path\to\your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
   ```
3. Once logged into the Ubuntu server, run these commands to install Docker and clone your repo:
   ```bash
   # 1. Update and install Docker
   sudo apt update
   sudo apt install -y docker.io git

   # 2. Clone your repository
   git clone https://github.com/YourUsername/YourRepoName.git
   cd YourRepoName/ml-service

   # 3. Build the Docker Image
   sudo docker build -t resort-ml .

   # 4. Run the container in the background (detached mode)
   sudo docker run -d -p 8000:8000 --name ml-api resort-ml
   ```

### Step 3C: Verify and Connect
1. Test your ML API by visiting this URL in your browser: 
   `http://<YOUR_EC2_PUBLIC_IP>:8000/api/v1/ml/health`
2. If it returns `{"status":"ok"}`, your ML service is live!
3. **Final Step:** Take that `http://<YOUR_EC2_PUBLIC_IP>:8000/api/v1/ml` URL and add it to your Render.com Backend Environment Variables as `ML_SERVICE_URL`.

---

## 4. Final Hackathon Checklist
- [ ] Vercel Dashboard is live.
- [ ] Vercel Booking Site is live.
- [ ] Render Backend is live and connected to the Neon Database.
- [ ] AWS EC2 is running the Dockerized Python ML service on port 8000.
- [ ] Both Vercel apps have their `VITE_API_BASE_URL` pointing to the Render URL.
- [ ] The Render app has its `ML_SERVICE_URL` pointing to the EC2 IP.
