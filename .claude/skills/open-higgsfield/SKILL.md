---
name: open-higgsfield
description: Set up, run, or modify OpenHiggsfield AI (github.com/wide-trace/open-higgsfield), the open-source Next.js studio that generates images and videos from one prompt bar with 38 models (Soul, Seedance, Kling, Wan, Flux, Ideogram, Recraft, LTX, MiniMax, PixVerse, Grok, Qwen...). Use when the user wants to generate AI images or video with OpenHiggsfield, self-host it, or change its code.
---

# OpenHiggsfield AI

Open-source alternative to Higgsfield AI. Next.js 16 App Router, React 19, plain CSS, Zustand, pnpm.
Hosted version (no install): https://openhiggsfield.ai — the user adds their own platform key (`id:secret`).

## Self-host

```sh
git clone https://github.com/wide-trace/open-higgsfield
cd open-higgsfield
cp .env.example .env.local   # HF_API_BASE_URL (generation API origin, server only), OPEN_HIGGSFIELD_READ_WRITE_TOKEN (Vercel Blob uploads)
pnpm install
pnpm dev                     # http://localhost:3000
```

Then open the studio, press **Add key** and paste the platform key as `id:secret`. The key is stored in an httpOnly cookie by a server action; never print it or commit it.

Scripts: `pnpm dev` (port 3000), `pnpm build`, `pnpm start`, `pnpm brand` (rebuild icons and OG card in `public/`).

## How generation works

- The selected model decides image vs. video; each model declares its own allowed settings (aspect ratio, resolution, duration, format, audio, batch size, prompt enhancement).
- Submit is `POST {HF_API_BASE_URL}/{model}`; status is `GET /requests/{id}/status`; auth header `Authorization: Key <api_key>`.
- Uploads go client-direct to Vercel Blob through `/api/blob`.
- Code for requests, server actions, API mapping, the model catalog and stores lives in `src/**/generation/`.

## Rules

- Never fabricate a finished generation: check the request status and only report a run as done when the API says so; report failed/NSFW/canceled runs honestly.
- Generations cost credits on the user's key — confirm before batch or 4K/long video runs.
