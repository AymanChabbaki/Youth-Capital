# Simulation Deployment: Vercel Micro-Service Guide

This guide details how to correctly and professionally host the **Youth Capital** simulation's frontend and backend as separate services on Vercel.

## 1. Backend Deployment (API)

### Setup
- **Root Directory**: `backend`
- **Framework Preset**: `Next.js` (or `Other`)
- **Node.js Version**: `20.x` or higher

### Environment Variables
Set these in the Vercel Project Settings:
- `DATABASE_URL`: Your professional PostgreSQL junction string.
- `JWT_SECRET`: A high-entropy security token for session signing.
- `ALLOWED_ORIGINS`: The URL of your deployed frontend (once known).
- `CLOUDINARY_CLOUD_NAME`: Required for media management.
- `CLOUDINARY_API_KEY`: Required for media management.
- `CLOUDINARY_API_SECRET`: Required for media management.
- `VITE_DISCORD_LINK`: The invitation link for simulation onboarding.

---

## 2. Frontend Deployment (Civic Portals)

### Setup
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: `Vite`

### Environment Variables
Set these in the Vercel Project Settings:
- `VITE_API_URL`: The URL of your deployed **Backend** service.
- `VITE_DISCORD_LINK`: The invitation link for simulation onboarding.

---

## 3. High-End Synchronization Tips

> [!IMPORTANT]
> Ensure that your **Backend** `ALLOWED_ORIGINS` precisely matches the **Frontend** Vercel URL to allow secure, cross-origin communication for your civic participants.

> [!TIP]
> Use Vercel's **System Environment Variables** to dynamically handle development, staging, and production environments across both simulation sectors.

---

**The simulation is now ready for professional cloud hosting. Good luck on your civic journey!** 🚀
