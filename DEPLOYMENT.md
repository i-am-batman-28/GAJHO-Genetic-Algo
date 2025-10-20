# 🚀 Deploying to Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git installed on your computer

---

## 📋 Deployment Steps

### **Step 1: Initialize Git Repository (if not already done)**

Open terminal in the project root (`tsp-ga-jgho-app/`) and run:

```bash
# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: GA-JGHO TSP Solver with multi-algorithm comparison"
```

---

### **Step 2: Push to GitHub Repository**

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/i-am-batman-28/GAJHO-Genetic-Algo.git

# Check current branch name
git branch

# If branch is 'master', rename to 'main' (optional but recommended)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** If the repository already has content, you might need to pull first:
```bash
git pull origin main --allow-unrelated-histories
```

---

### **Step 3: Deploy to Vercel**

#### **Option A: Deploy via Vercel Website (Recommended for First Time)**

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Click "Sign Up" or "Login"
   - Choose "Continue with GitHub"

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Find and select `GAJHO-Genetic-Algo` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `tsp-ga-jgho-app` (if project is in subdirectory)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Environment Variables:** (None needed for this project)

5. **Deploy:**
   - Click "Deploy"
   - Wait 1-2 minutes for build to complete
   - Your app will be live at: `https://your-project-name.vercel.app`

#### **Option B: Deploy via Vercel CLI (Alternative)**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project directory
cd /Users/karthiksarma/Desktop/SCEAI/tsp-ga-jgho-app

# Deploy to production
vercel --prod
```

---

### **Step 4: Custom Domain (Optional)**

After deployment, you can add a custom domain:
1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## 🔄 Continuous Deployment

Once connected to GitHub:
- **Every push to `main` branch** → Automatic production deployment
- **Every push to other branches** → Automatic preview deployment
- **Every pull request** → Preview deployment with unique URL

---

## 🛠️ Troubleshooting

### **Build Fails with TypeScript Errors:**
```bash
# Run build locally to check for errors
npm run build

# Fix any TypeScript errors before pushing
```

### **404 Errors on Routes:**
- Already handled by `vercel.json` rewrites configuration

### **Build Timeout:**
- Check if `node_modules` was accidentally committed (should be in `.gitignore`)
- Ensure dependencies are in `package.json`, not `devDependencies`

### **Environment Variables:**
- This project doesn't need any, but if you add API keys later:
  - Add them in Vercel Dashboard → Settings → Environment Variables
  - Never commit `.env` files to GitHub

---

## 📦 What Gets Deployed

**Included:**
- All source code in `src/`
- Public assets in `public/`
- Build configuration files
- `package.json` dependencies

**Excluded (via .gitignore):**
- `node_modules/` (rebuilt on Vercel)
- `dist/` (generated during build)
- `.env` files
- Editor configurations

---

## ✅ Verify Deployment

After deployment:
1. Visit your Vercel URL
2. Test features:
   - ✅ Place cities on canvas
   - ✅ Run GA-JGHO algorithm
   - ✅ View performance charts
   - ✅ Load TSPLIB datasets
   - ✅ Compare algorithms (Standard GA, ABCTSP, PACO-3Opt)
   - ✅ Adjust parameters with sliders
3. Check browser console for errors (F12)
4. Test on mobile devices

---

## 🎉 Success!

Your GA-JGHO app is now live and accessible worldwide!

**Share your deployment:**
- Copy the Vercel URL: `https://your-project.vercel.app`
- Add it to your GitHub repository description
- Share in your thesis/paper/presentation

---

## 📝 Next Steps After Deployment

1. **Update README.md** with live demo link
2. **Add screenshots** to repository
3. **Create documentation** for users
4. **Monitor analytics** in Vercel Dashboard
5. **Set up custom domain** (optional)

---

## 🆘 Need Help?

- **Vercel Documentation:** https://vercel.com/docs
- **Vite Documentation:** https://vitejs.dev/guide/
- **Vercel Support:** https://vercel.com/support

---

**Deployment configured by:** GitHub Copilot  
**Date:** October 20, 2025  
**Repository:** https://github.com/i-am-batman-28/GAJHO-Genetic-Algo
