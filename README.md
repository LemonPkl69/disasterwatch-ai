<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1doyaH2-jdPCdRB4cvmTh8rmN8EOFEWg_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on GitHub Pages

This repo is set up to deploy to **https://LemonPkl69.github.io/disasterwatch-ai/**.

1. **Enable GitHub Pages:** In the repo go to **Settings → Pages**. Under "Build and deployment", set **Source** to **GitHub Actions**.
2. **Add API key:** Go to **Settings → Secrets and variables → Actions**. Add a repository secret named **`API_KEY`** with your Gemini API key (same value as `GEMINI_API_KEY` in `.env.local`).
3. Push to `main` (or run the "Deploy to GitHub Pages" workflow manually). The site will be built and published automatically.
