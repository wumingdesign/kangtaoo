# KangTaoo 康头 — Find Your Next Web Dev Client

> "Cari kangtao" — scan real Google Places data for businesses that need a website, then let AI write the pitch.

## 🚀 Deploy to Vercel (Step by Step)

### 1. Create GitHub account & push code
1. Go to [github.com](https://github.com) → Sign up
2. Create a new repository called `kangtaoo`
3. Upload all these project files to the repo

### 2. Get your Anthropic API key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. API Keys → Create Key
3. Copy the key (starts with `sk-ant-`)

### 3. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click "Add New Project" → Import your `kangtaoo` repo
3. Before deploying, add Environment Variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key
4. Click Deploy — done!

### 4. Connect your domain (kangtaoo.com)
1. In Vercel → Project Settings → Domains
2. Add `kangtaoo.com`
3. Vercel gives you DNS records to add at your domain registrar
4. Done — live in ~5 minutes

### 5. Set up Google Places API key
- In the app, click "Add Key" and enter your Google Places API key
- Key stays in the user's browser — never hits your server

---

## 🛠 Local Development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

---

## 📁 Project Structure

```
kangtaoo/
├── api/
│   └── claude.js        ← Vercel serverless function (hides Anthropic key)
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   └── ScannerPage.jsx
│   ├── components/
│   │   ├── LeadCard.jsx
│   │   ├── PitchModal.jsx
│   │   └── Pagination.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── package.json
└── .env.example         ← Copy to .env.local with your keys
```

---

## 🗺 Roadmap

- **Phase 1** (now) — Lead scanner, AI pitch, export CSV
- **Phase 2** — User login, saved leads, progress tracker (Supabase)
- **Phase 3** — Subscription billing (Stripe), usage limits, Pro tier

---

## 💰 Running Costs (at launch)

| Service | Cost |
|---|---|
| Vercel | Free |
| Supabase | Free (Phase 2) |
| Anthropic API | ~$0.01 per scan |
| Google Places API | $200 free credit/month |
| **Total** | **~$0** until you have paying users |
