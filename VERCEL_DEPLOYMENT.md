# Deploying Vyora to Vercel

> **Complete Guide for Deploying Vyora to Vercel**

---

## ⚡ Method 1: Deploy directly via Vercel CLI (Fastest)

Open your terminal in the `frontend` folder and run Vercel CLI via `npx`:

```bash
cd c:\SARATH\Vyora\frontend
npx vercel
```

### Prompt Responses:
1. **Set up and deploy?**: `y` (Yes)
2. **Which scope?**: Select your personal or team Vercel account
3. **Link to existing project?**: `n` (No)
4. **Project Name**: `vyora-finance` (or press Enter)
5. **In which directory is your code located?**: `./`
6. **Want to modify build settings?**: `n` (No)

Vercel will build and generate your live URL (e.g. `https://vyora-finance.vercel.app`).

To deploy directly to production:
```bash
npx vercel --prod
```

---

## 🐙 Method 2: Deploy via GitHub Integration (Recommended for CI/CD)

### Step 1: Push Repository to GitHub
```bash
cd c:\SARATH\Vyora
git init
git add .
git commit -m "Initial commit of Vyora AI Personal Finance Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vyora.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select the **`vyora`** repository.
3. In **Root Directory**, click **Edit** and select **`frontend`**.
4. Click **Deploy**.

---

## ⚙️ Environment Variables on Vercel

If you deploy your backend API to Render/Railway/DigitalOcean, add the following Environment Variable in Vercel Project Settings:

| Key | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` | URL of production Node.js API |

*(If left blank, Vyora automatically utilizes its built-in fallback AI engine so your Vercel deployment works 100% out-of-the-box!)*
