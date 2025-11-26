# 🚀 Frontend Deployment Guide - Render

**Date**: 2025-10-21  
**Status**: ✅ READY FOR DEPLOYMENT  
**Framework**: React + Vite  
**Build Tool**: Vite

---

## 📋 Quick Summary

Your Paeshift frontend is ready to deploy to Render! This guide covers:
- ✅ Environment variables setup
- ✅ Build configuration
- ✅ Deployment to Render
- ✅ Connecting to backend
- ✅ Testing and verification

---

## 🔑 Environment Variables

### Local Development

**1. Create `.env.local` file**
```bash
cp .env.example .env.local
```

**2. Edit `.env.local` with your values**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your-key
VITE_GOOGLE_CLIENT_ID=your-client-id
```

**3. Add to `.gitignore`** (already done)
```
.env
.env.local
.env.*.local
```

### Production (Render)

Set these in Render Dashboard → Environment:

```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GOOGLE_MAPS_API_KEY=your-key
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_APP_ENV=production
NODE_ENV=production
```

---

## 📦 Build Configuration

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

### vite.config.js

Already configured with:
- ✅ React plugin
- ✅ Path aliases
- ✅ Development server
- ✅ Build optimization
- ✅ Code splitting
- ✅ Environment variable loading

---

## 🚀 Deployment Steps

### Step 1: Prepare Repository

**1. Ensure all files are committed**
```bash
git status
git add .
git commit -m "Prepare frontend for Render deployment"
```

**2. Verify .gitignore**
```bash
cat .gitignore
# Should include: .env, .env.local, dist, node_modules
```

**3. Push to GitHub**
```bash
git push origin main
```

### Step 2: Create Render Web Service

**1. Go to Render Dashboard**
```
https://render.com/dashboard
```

**2. Create New Web Service**
```
New → Web Service
```

**3. Connect Repository**
```
- Select your frontend repository
- Branch: main
```

**4. Configure Service**
```
Name: paeshift-frontend
Environment: Node
Build Command: npm install && npm run build
Start Command: npm run preview
```

**5. Set Environment Variables**
```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GOOGLE_MAPS_API_KEY=your-key
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_APP_ENV=production
NODE_ENV=production
```

**6. Deploy**
```
Click "Create Web Service"
```

### Step 3: Verify Deployment

**1. Check Build Logs**
```
Services → paeshift-frontend → Logs
```

**2. Test Frontend URL**
```
https://paeshift-frontend.onrender.com
```

**3. Verify API Connection**
```
Open browser console (F12)
Check for API errors
```

---

## 🔗 Connecting to Backend

### Update API Configuration

The frontend automatically uses `VITE_API_BASE_URL` environment variable.

**Local Development**:
```
VITE_API_BASE_URL=http://localhost:8000
```

**Production**:
```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

### Verify Connection

**1. Check config.js**
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;
```

**2. Test API calls**
```javascript
// In browser console
fetch('https://your-backend.onrender.com/api/jobs/all/')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 📝 Environment Variables Reference

| Variable | Local | Production | Required |
|----------|-------|------------|----------|
| `VITE_API_BASE_URL` | http://localhost:8000 | https://your-backend.onrender.com | ✅ YES |
| `VITE_GOOGLE_MAPS_API_KEY` | your-key | your-key | ✅ YES |
| `VITE_GOOGLE_CLIENT_ID` | your-id | your-id | ✅ YES |
| `VITE_APP_ENV` | development | production | ❌ NO |
| `NODE_ENV` | development | production | ❌ NO |
| `VITE_FACEBOOK_APP_ID` | your-id | your-id | ❌ NO |
| `VITE_APPLE_CLIENT_ID` | your-id | your-id | ❌ NO |

---

## 🔒 Security Checklist

- [x] `.env` files in `.gitignore`
- [x] No secrets in code
- [x] Environment variables documented
- [ ] Backend CORS configured
- [ ] Frontend URL in backend CORS_ALLOWED_ORIGINS
- [ ] HTTPS enabled (Render does this automatically)
- [ ] API keys rotated if exposed

---

## 🧪 Testing

### Local Testing

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
cp .env.example .env.local

# 3. Edit with your values
nano .env.local

# 4. Start dev server
npm run dev

# 5. Open browser
http://localhost:3000
```

### Production Testing

```bash
# 1. Build for production
npm run build

# 2. Preview build
npm run preview

# 3. Test at http://localhost:4173
```

---

## 📊 Build Output

After running `npm run build`:

```
dist/
├── index.html
├── assets/
│   ├── react-vendor-xxxxx.js
│   ├── router-vendor-xxxxx.js
│   ├── ui-vendor-xxxxx.js
│   ├── form-vendor-xxxxx.js
│   ├── query-vendor-xxxxx.js
│   ├── map-vendor-xxxxx.js
│   ├── notification-vendor-xxxxx.js
│   ├── icon-vendor-xxxxx.js
│   ├── index-xxxxx.js
│   └── style-xxxxx.css
```

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
npm install --legacy-peer-deps
```

### API Connection Failed

**Error**: `CORS error` or `Cannot reach backend`

**Solution**:
1. Verify `VITE_API_BASE_URL` is correct
2. Check backend CORS settings
3. Ensure backend is running
4. Check browser console for errors

### Blank Page

**Error**: Page loads but shows nothing

**Solution**:
1. Check browser console (F12)
2. Check Render logs
3. Verify environment variables
4. Check for JavaScript errors

### Slow Build

**Solution**:
1. Use `npm ci` instead of `npm install`
2. Enable caching in Render
3. Optimize dependencies

---

## 📚 File Structure

```
paeshift-frontend/
├── .env.example          ← Template (commit to git)
├── .env.local            ← Local values (NOT in git)
├── .gitignore            ← Prevents committing secrets
├── Procfile              ← Render startup command
├── package.json          ← Dependencies
├── vite.config.js        ← Build configuration
├── index.html            ← Entry point
├── src/
│   ├── config.js         ← API configuration
│   ├── main.jsx          ← React entry
│   ├── components/       ← React components
│   ├── pages/            ← Page components
│   ├── services/         ← API services
│   ├── auth/             ← Authentication
│   ├── hooks/            ← Custom hooks
│   ├── store/            ← State management
│   └── utils/            ← Utilities
└── dist/                 ← Build output (generated)
```

---

## ✅ Deployment Checklist

### Before Deploying
- [ ] All code committed to git
- [ ] `.env.local` created locally
- [ ] `.env.local` NOT committed
- [ ] `.gitignore` updated
- [ ] `npm run build` succeeds locally
- [ ] `npm run preview` works locally
- [ ] Backend is deployed and running
- [ ] Backend CORS configured

### On Render
- [ ] Web Service created
- [ ] Repository connected
- [ ] Build command set
- [ ] Start command set
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] No build errors in logs

### After Deployment
- [ ] Frontend loads at https://your-frontend.onrender.com
- [ ] API calls work
- [ ] No console errors
- [ ] Authentication works
- [ ] Forms submit successfully
- [ ] Maps load correctly
- [ ] Images load correctly

---

## 🔄 Redeploying

### Manual Redeploy

```
Render Dashboard → Services → paeshift-frontend → Manual Deploy
```

### Auto Redeploy

Render automatically redeploys when you push to main branch.

### Clear Cache

```
Render Dashboard → Settings → Clear Build Cache
```

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check logs, run `npm install --legacy-peer-deps` |
| API not responding | Verify `VITE_API_BASE_URL`, check backend |
| CORS errors | Update backend `CORS_ALLOWED_ORIGINS` |
| Blank page | Check console errors, verify env vars |
| Slow loading | Optimize bundle, enable caching |
| 404 errors | Check routing, verify API endpoints |

---

## 🎯 Next Steps

1. ✅ Prepare repository
2. ✅ Create Render Web Service
3. ✅ Set environment variables
4. ✅ Deploy
5. ✅ Test API connection
6. ✅ Verify all features work

---

## 📚 Useful Links

- **Render Dashboard**: https://render.com/dashboard
- **Render Docs**: https://render.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html

---

**Status**: ✅ READY FOR DEPLOYMENT  
**Next**: Deploy to Render

---

*For backend deployment, see `paeshift-recover/00_READ_ME_FIRST.md`*

