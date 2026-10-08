# RealNest

RealNest is a modern, full-stack real estate application featuring property management, navigation, and user authentication with Google OAuth. The project is built using React with Vite for the frontend and a Node.js server for the backend.

---

## 🚀 Live Services & Deployment

* **Live Demo:** [RealNest Web App](https://realnest-vert.vercel.app/)
* **Frontend Deployment:** [Vercel Dashboard](https://vercel.com/hamonta002/realnest)
* **Backend Web Service:** [Render Dashboard](https://dashboard.render.com/web/srv-db33h6vlk1mc739afnc0)
* **Authentication Credentials:** [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials?project=realnest-login-510717)
* **Source Code:** [GitHub Repository](https://github.com/Hamonta002/RealNest)

---

## ✨ Features

* **Property Search & Viewing:** Browse detailed real estate listings with dedicated property views.
* **Google Authentication:** Secure login integration configured via Google Cloud OAuth.
* **Full-Stack Architecture:** Decoupled client-server design for independent scaling and deployment.
* **Optimized Build:** Frontend powered by Vite for fast development and lightweight bundles.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, JavaScript, CSS, HTML
* **Backend:** Node.js, Express
* **Authentication:** Google OAuth 2.0 (`realnest-login-510717`)
* **Hosting Platforms:** Vercel (Frontend), Render (Backend)

---

## 📁 Directory Structure

```text
RealNest/
├── backend/            # Express/Node.js API server
├── public/             # Static public assets
├── src/                # React source code (components, pages, styles)
├── .env.example        # Template for local environment variables
├── .gitignore          # Git exclusion rules
├── fix_details.cjs     # Utility patch script for property details
├── fix_login.cjs       # Utility patch script for authentication
├── fix_nav.js          # Utility patch script for navigation
├── index.html          # HTML template entry point
├── package.json        # Frontend project metadata and dependencies
├── vercel.json         # Vercel deployment configuration
└── vite.config.js      # Vite build configuration

```

---

## ⚙️ Local Development Setup

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later recommended)
* `npm` or `yarn` package manager

### 1. Clone the Repository

```bash
git clone https://github.com/Hamonta002/RealNest.git
cd RealNest

```

### 2. Environment Configuration

Copy the sample environment file and set up your local variables for both the client and server:

```bash
cp .env.example .env

```

Ensure your `.env` file includes your Google OAuth Client ID (from [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=realnest-login-510717)) and your API backend URL.

### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

```

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start backend API server
npm start

```

---

## 🌐 Deployment Configuration

* **Frontend:** Configured with `vercel.json` for automated deployments via [Vercel](https://vercel.com/hamonta002/realnest).
* **Backend:** Deployed as an active web service on [Render](https://dashboard.render.com/web/srv-db33h6vlk1mc739afnc0).
* **OAuth Credentials:** Authorized origins and redirect URIs managed under project `realnest-login-510717` in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=realnest-login-510717).
