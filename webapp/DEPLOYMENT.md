# Frontend Deployment Guide

## Prerequisites
- Node.js 18+
- Environment variables configured

## Build Steps
1. Install dependencies: `npm install`
2. Build frontend: `npm run build`
3. Deploy to Vercel/Netlify

## Environment Variables
- VITE_BELIEF_MARKET_ADDRESS (optional, hardcoded in contracts.ts)
- VITE_WALLETCONNECT_PROJECT_ID

## Vercel Configuration
See `vercel.json` for deployment settings.
