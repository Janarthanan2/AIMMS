# AIMMS Deployment Guide

This guide covers how to deploy the **AIMMS Frontend** to Netlify.

> [!IMPORTANT]
> **Backend Deployment Required**: This guide only deploys the *frontend* (the visible website). Your *backend* (Spring Boot) and *OCR Service* (Python) **must be hosted separately** (e.g., on Render, Railway, AWS, or Azure) for the app to work. Netlify **cannot** run Java or Python backends.

## Part 1: Prepare for Netlify

1.  **Verify Configuration**:
    - Ensure `netlify.toml` exists in the **project root folder** (I have moved this for you).
    - This file tells Netlify to look in the `aimms-frontend` folder.

2.  **Push to GitHub**:
    - Make sure your latest code, including `netlify.toml`, is pushed to your GitHub repository.

## Part 2: Deploy to Netlify

1.  **Log in to Netlify**: Go to [netlify.com](https://www.netlify.com/) and log in.
2.  **Add New Site**:
    - Click **"Add new site"** -> **"Import from an existing project"**.
3.  **Connect to GitHub**:
    - Choose **GitHub**.
    - Authorize Netlify if asked.
    - Select your **AIMMS** repository.
4.  **Configure Build**:
    - **Base directory**: `aimms-frontend`
    - **Build command**: `npm run build`
    - **Publish directory**: `dist`
    - *(These should be auto-detected from `netlify.toml`, but double-check them)*.
5.  **Environment Variables**:
    - Click **"Add environment variables"**.
    - **Key**: `VITE_API_BASE`
    - **Value**: The URL of your *deployed* backend (e.g., `https://my-aimms-backend.onrender.com/api`).
    - *Note*: If you haven't deployed the backend yet, you can leave this blank for now, but the app won't be able to fetch data.
6.  **Deploy**:
    - Click **"Deploy aimms-frontend"**.

## Part 3: Backend Hosting (Next Steps)

Since Netlify only hosts static sites, you need a different provider for the backend.

**Recommended Option: Render (Free Tier)**
1.  Create a `Dockerfile` for your Spring Boot backend.
2.  Create a new "Web Service" on [Render](https://render.com/).
3.  Connect your repo.
4.  Set the Root Directory to `aimms-backend`.
5.  Deploy.
6.  Use the URL provided by Render as the `VITE_API_BASE` in Netlify.
