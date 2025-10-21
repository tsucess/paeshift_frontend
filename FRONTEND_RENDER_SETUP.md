# 🎯 Frontend Render Setup - Step by Step

**Date**: 2025-10-21  
**Status**: ✅ READY  
**Framework**: React + Vite

---

## 📋 Prerequisites

- ✅ Frontend code in GitHub repository
- ✅ Backend deployed to Render
- ✅ Backend URL available (e.g., https://your-backend.onrender.com)
- ✅ Render account created

---

## 🚀 Step 1: Prepare Frontend Repository

### 1.1 Verify Files

```bash
# Check required files exist
ls -la .env.example
ls -la Procfile
ls -la package.json
ls -la vite.config.js
```

### 1.2 Update .env.example

Ensure it has all required variables:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your-key
VITE_GOOGLE_CLIENT_ID=your-client-id
```

### 1.3 Verify .gitignore

```bash
cat .gitignore
# Should include:
# .env
# .env.local
# dist
# node_modules
```

### 1.4 Commit and Push

```bash
git add .
git commit -m "Prepare frontend for Render deployment"
git push origin main
```

---

## 🎨 Step 2: Create Render Web Service

### 2.1 Go to Render Dashboard

```
https://render.com/dashboard
```

### 2.2 Create New Service

```
Click: New → Web Service
```

### 2.3 Connect Repository

```
1. Click "Connect a repository"
2. Select your frontend repository
3. Click "Connect"
```

### 2.4 Configure Service

**Name**:
```
paeshift-frontend
```

**Environment**:
```
Node
```

**Build Command**:
```
npm install && npm run build
```

**Start Command**:
```
npm run preview
```

**Plan**:
```
Free (or paid if needed)
```

---

## 🔑 Step 3: Set Environment Variables

### 3.1 Go to Environment Tab

```
Services → paeshift-frontend → Settings → Environment
```

### 3.2 Add Variables

Click "Add Environment Variable" for each:

**Variable 1: API URL**
```
Key: VITE_API_BASE_URL
Value: https://your-backend.onrender.com
```

**Variable 2: Google Maps API Key**
```
Key: VITE_GOOGLE_MAPS_API_KEY
Value: your-actual-google-maps-api-key
```

**Variable 3: Google Client ID**
```
Key: VITE_GOOGLE_CLIENT_ID
Value: your-actual-google-client-id
```

**Variable 4: App Environment**
```
Key: VITE_APP_ENV
Value: production
```

**Variable 5: Node Environment**
```
Key: NODE_ENV
Value: production
```

### 3.3 Save Variables

Click "Save" after adding all variables.

---

## 🚀 Step 4: Deploy

### 4.1 Click Deploy

```
Click "Create Web Service"
```

### 4.2 Monitor Build

```
Services → paeshift-frontend → Logs
```

Watch for:
- ✅ `npm install` completes
- ✅ `npm run build` completes
- ✅ `npm run preview` starts
- ✅ Service is live

### 4.3 Wait for Deployment

Typical deployment time: 5-10 minutes

---

## ✅ Step 5: Verify Deployment

### 5.1 Check Service Status

```
Services → paeshift-frontend
Status should be: "Live"
```

### 5.2 Get Frontend URL

```
Your frontend URL: https://paeshift-frontend.onrender.com
(or your custom domain)
```

### 5.3 Test Frontend

```
1. Open https://paeshift-frontend.onrender.com
2. Should load without errors
3. Check browser console (F12) for errors
```

### 5.4 Test API Connection

```
1. Open browser console (F12)
2. Run: fetch('https://your-backend.onrender.com/api/jobs/all/')
3. Should return data (not CORS error)
```

---

## 🔗 Step 6: Update Backend CORS

### 6.1 Go to Backend Settings

```
paeshift-recover/payshift/settings.py
```

### 6.2 Update CORS_ALLOWED_ORIGINS

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://paeshift-frontend.onrender.com',  # Add this
]
```

### 6.3 Commit and Push

```bash
git add payshift/settings.py
git commit -m "Add frontend URL to CORS"
git push origin main
```

### 6.4 Redeploy Backend

```
Render Dashboard → paeshift-backend → Manual Deploy
```

---

## 🧪 Step 7: Test Everything

### 7.1 Test Frontend Loading

```
✅ Frontend loads at https://paeshift-frontend.onrender.com
✅ No console errors
✅ All pages load
```

### 7.2 Test API Connection

```
✅ Login works
✅ Jobs load
✅ Can apply for jobs
✅ Can create jobs
```

### 7.3 Test Features

```
✅ Authentication works
✅ Forms submit
✅ Maps load
✅ Images load
✅ Notifications work
```

---

## 📊 Environment Variables Summary

| Variable | Local | Production |
|----------|-------|------------|
| `VITE_API_BASE_URL` | http://localhost:8000 | https://your-backend.onrender.com |
| `VITE_GOOGLE_MAPS_API_KEY` | your-key | your-key |
| `VITE_GOOGLE_CLIENT_ID` | your-id | your-id |
| `VITE_APP_ENV` | development | production |
| `NODE_ENV` | development | production |

---

## 🔄 Redeploying

### Manual Redeploy

```
Services → paeshift-frontend → Manual Deploy
```

### Auto Redeploy

Render automatically redeploys when you push to main.

### Clear Cache

```
Services → paeshift-frontend → Settings → Clear Build Cache
```

---

## 🐛 Troubleshooting

### Build Fails

**Check logs**:
```
Services → paeshift-frontend → Logs
```

**Common fixes**:
```bash
npm install --legacy-peer-deps
npm ci  # Instead of npm install
```

### API Not Responding

**Check**:
1. Backend is deployed and running
2. `VITE_API_BASE_URL` is correct
3. Backend CORS includes frontend URL
4. No typos in environment variables

### Blank Page

**Check**:
1. Browser console (F12) for errors
2. Render logs for build errors
3. Environment variables are set
4. Backend is responding

### CORS Errors

**Fix**:
1. Update backend `CORS_ALLOWED_ORIGINS`
2. Include frontend URL
3. Redeploy backend
4. Clear browser cache

---

## ✅ Deployment Checklist

- [ ] Frontend code committed to GitHub
- [ ] `.env.local` created locally (NOT committed)
- [ ] `.gitignore` includes `.env*`
- [ ] `npm run build` works locally
- [ ] Backend deployed to Render
- [ ] Render Web Service created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Frontend loads without errors
- [ ] API connection works
- [ ] Backend CORS updated
- [ ] All features tested

---

## 📞 Support

### Check Logs

```
Services → paeshift-frontend → Logs
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check logs, try `npm install --legacy-peer-deps` |
| API errors | Verify backend URL, check CORS |
| Blank page | Check console, verify env vars |
| Slow loading | Check bundle size, optimize |

---

## 🎯 Next Steps

1. ✅ Prepare repository
2. ✅ Create Render Web Service
3. ✅ Set environment variables
4. ✅ Deploy
5. ✅ Update backend CORS
6. ✅ Test everything

---

**Status**: ✅ READY FOR DEPLOYMENT  
**Estimated Time**: 15-20 minutes

---

*For backend deployment, see `paeshift-recover/00_READ_ME_FIRST.md`*

