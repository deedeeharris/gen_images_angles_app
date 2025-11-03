<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1W1UBPFIwHFFcaZZKPIp8sz-n5yqR56gJ

## Quick Start (Windows)

**Easiest way for Windows users:**

1. Make sure you have Node.js installed (download from https://nodejs.org/)
2. Double-click `start.bat` (or right-click `start.ps1` → Run with PowerShell)
3. The app will automatically install dependencies and open in your browser!
4. The PowerShell window will stay open showing server logs

When the app opens, enter your Gemini API key in the popup (get it free from https://aistudio.google.com/apikey)

---

## Run Locally (Manual Setup)

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. **Set up your Gemini API key (choose one option):**

   **Option A: Enter in the app (easiest)**
   - When you first open the app, a modal will prompt you to enter your API key
   - Get your free API key from: https://aistudio.google.com/apikey
   - The key will be saved in your browser's localStorage
   - You can change it later by clicking "שנה API Key" in the settings panel

   **Option B: Use environment file**
   - Open the [.env.local](.env.local) file
   - Replace `PLACEHOLDER_API_KEY` with your actual Gemini API key
   - Example: `GEMINI_API_KEY=AIzaSyA...your_actual_key_here`

3. Run the app:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000

## Common Issues

### "Cannot read properties of undefined (reading 'parts')" Error
This means the API key is not set correctly. Make sure you've replaced `PLACEHOLDER_API_KEY` in `.env.local` with your actual Gemini API key.

### Tailwind CSS CDN Warning
The warning about `cdn.tailwindcss.com` is normal for development. For production deployment, consider installing Tailwind CSS properly via PostCSS.

---

## Deploy to GitHub Pages

This project is configured for automatic deployment to GitHub Pages!

### Initial Setup (One-Time)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Enable GitHub Pages:
   - Go to your repo: https://github.com/deedeeharris/gen_images_angles_app
   - Click **Settings** → **Pages** (in left sidebar)
   - Under "Build and deployment":
     - **Source**: Select "GitHub Actions"
   - Click Save

### Automatic Deployment

After the initial setup, every time you push to the `main` branch:
- GitHub Actions automatically builds your app
- Deploys to GitHub Pages
- Your app will be live at: **https://deedeeharris.github.io/gen_images_angles_app/**

You can check deployment status in the **Actions** tab of your repository.

### Manual Deployment

To manually trigger a deployment:
1. Go to **Actions** tab
2. Click "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
