# ImmuTrack — Clinical Vaccine Scheduler & Immunization Manager

A next-generation clinical vaccine scheduler for healthcare clinicians and patients, featuring soft neumorphic UI aesthetics, MongoDB Atlas database synchronization, real-time immunization status tracking, glowing overdue alerts, direct unsaved WhatsApp / SMS / GMail sharing, and Google Calendar pinpoint reminders.

---

## 🚀 Live Deployment on Render (Step-by-Step)

### Prerequisites
1. **GitHub Account**: To host the repository.
2. **Render Account**: Free account at [render.com](https://render.com).
3. **MongoDB Atlas**: Ensure Network Access allows `0.0.0.0/0` (Allow access from anywhere).

---

### Step 1: Push Project to GitHub

1. Open your terminal in the project directory:
   ```bash
   git add .
   git commit -m "Initial commit for Render deployment"
   ```

2. Create a new repository on [GitHub](https://github.com/new) (e.g., `vaccine-scheduler`).

3. Link and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/vaccine-scheduler.git
   git push -u origin main
   ```

---

### Step 2: Deploy on Render

#### Option A: Using the Included Blueprint (`render.yaml`) — Recommended
1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub repository `vaccine-scheduler`.
4. Render will automatically read `render.yaml` and configure:
   - **Service Name**: `vaccinescheduler`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. When prompted for `MONGODB_URI`, paste your MongoDB Atlas connection URI:
   ```env
   mongodb+srv://24pa1a0583_db_user:TzIs18L2T1TYiEoy@vaccinescheduler.czkuwcd.mongodb.net/vaccinescheduler?retryWrites=true&w=majority
   ```
6. Click **Apply**. Render will build and deploy your application.

#### Option B: Manual Web Service Setup
1. On [Render Dashboard](https://dashboard.render.com/), click **New +** &rarr; **Web Service**.
2. Select your repository.
3. Configure the settings:
   - **Name**: `vaccine-scheduler`
   - **Region**: Any (e.g., `Oregon (US West)` or `Singapore`)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `super_secret_vaccine_scheduler_jwt_key_2026_secure` |
   | `MONGODB_URI` | `mongodb+srv://24pa1a0583_db_user:TzIs18L2T1TYiEoy@vaccinescheduler.czkuwcd.mongodb.net/vaccinescheduler?retryWrites=true&w=majority` |
5. Click **Create Web Service**.

---

### ⚠️ Critical MongoDB Atlas Setup for Cloud Deployment

Render servers run on dynamic cloud IP addresses. For your Render deployment to connect to MongoDB Atlas without network timeouts:
1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. In the left menu under **Security**, click **Network Access**.
3. Click **Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the application locally:
   ```bash
   npm start
   ```

3. Open your browser at `http://localhost:3000`.

---

## 🩺 Demo Credentials

- **Doctor Portal**:
  - Email: `doctor@immu-track.org`
  - Password: `Doctor@123`
- **Patient Portal**:
  - Email: `patient@immu-track.org`
  - Password: `Patient@123`
