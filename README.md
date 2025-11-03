# עניין של זוויות (Angles App)

**AI-powered camera angle generator for product photography and creative content**

Transform a single image into multiple professional camera angles using Google's Gemini AI. Perfect for product photography, e-commerce, social media content, and creative projects.

🔗 **Live Demo:** [https://deedeeharris.github.io/gen_images_angles_app/](https://deedeeharris.github.io/gen_images_angles_app/)

---

## ✨ Features

- **13 Professional Camera Angles** - Generate images from eye-level, low angle, high angle, bird's eye view, POV, Dutch angle, and more
- **AI Image Editing** - Remove backgrounds, upscale quality, change backgrounds with text prompts
- **Before/After Comparison** - Interactive slider to compare original vs upscaled images
- **Canva Integration** - Export directly to Canva for further editing
- **Daily Usage Tracker** - Monitor your API usage with a built-in counter
- **Fully Client-Side** - Your API key stays in your browser, never sent to any server except Google's Gemini API

---

## 🎯 Use Cases

- **E-commerce:** Generate multiple product angles from a single photo
- **Social Media:** Create dynamic content variations for posts
- **Marketing:** Produce diverse visuals for campaigns
- **Photography:** Explore different perspectives quickly
- **Design:** Prototype different compositions

---

## 🚀 Quick Start

### Option 1: Use the Live Version (Easiest)
1. Visit: [https://deedeeharris.github.io/gen_images_angles_app/](https://deedeeharris.github.io/gen_images_angles_app/)
2. Enter your free Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/apikey))
3. Upload an image and start generating!

### Option 2: Run Locally (Windows)
1. Download/clone this repository
2. Make sure [Node.js](https://nodejs.org/) is installed
3. Double-click `start.bat`
4. The app opens automatically at http://localhost:3000

### Option 3: Run Locally (Manual)
```bash
npm install
npm run dev
```

---

## 🎨 How It Works

1. **Upload** - Drag & drop or select an image
2. **Select Angles** - Choose which camera angles to generate (or select all)
3. **Generate** - AI creates new images from each selected angle
4. **Edit** - Remove backgrounds, upscale, or change backgrounds
5. **Download** - Save your generated images or export to Canva

---

## 📸 Available Camera Angles

| Angle | Description |
|-------|-------------|
| **Eye Level** | Neutral, realistic perspective |
| **Low Angle** | Makes subject appear powerful and dominant |
| **High Angle** | Makes subject appear smaller, vulnerable |
| **Bird's Eye View** | Top-down overview of the scene |
| **Rear View** | Behind the subject, emphasizing journey/destination |
| **Dutch Angle** | Tilted for tension and unease |
| **POV (Point of View)** | See through the subject's eyes |
| **Over the Shoulder** | Creates intimacy in conversations |
| **Profile (Left/Right)** | Side view highlighting contours |
| **3/4 Profile (Left/Right)** | Popular angle between frontal and profile |
| **Tracking Shot** | Creates sense of movement and dynamism |

---

## 🔑 API Key Setup

You'll need a **free Gemini API key** from Google:

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)

**Two ways to use it:**
- **In-app (recommended):** Paste it in the modal when you first open the app
- **Environment file:** Add it to `.env.local` as `GEMINI_API_KEY=your_key_here`

Your API key is stored securely in your browser's localStorage and never sent anywhere except Google's Gemini API.

---

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Google Gemini 2.5 Flash** - AI image generation
- **GitHub Pages** - Free hosting

---

## 📦 Deployment

This project auto-deploys to GitHub Pages via GitHub Actions.

**Every push to `main` automatically:**
1. Builds the production version
2. Deploys to GitHub Pages
3. Goes live at your GitHub Pages URL

**Manual deployment:**
```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

---

## 📝 License

This project was created with [Google AI Studio](https://ai.studio/apps/drive/1W1UBPFIwHFFcaZZKPIp8sz-n5yqR56gJ).

---

## 🤝 Contributing

Feel free to open issues or submit pull requests!

---

## ⚠️ Notes

- **Daily Limit:** The app tracks usage locally (resets daily). Your actual Gemini API limits may vary.
- **API Costs:** Gemini API has a free tier. Check [Google's pricing](https://ai.google.dev/pricing) for details.
- **Image Quality:** Results depend on input image quality and AI interpretation.

---

**Made with ❤️ using Google Gemini AI**
