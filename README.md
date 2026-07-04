# peel — shop widget builder

A live builder for embeddable product cards that send orders straight to
WhatsApp or email. Edit products on the left, watch the real shop preview
update on the right, then copy the embed snippet for your site.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview   # serve the production build locally to check it
```

The build output goes to `dist/` — deploy that folder anywhere that serves
static files (Netlify, Vercel, GitHub Pages, S3, etc).

## Project structure

```
shop-builder/
├── index.html          entry HTML, loads fonts + mounts React
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx         React root
    ├── index.css        global reset + focus states
    └── ShopBuilder.jsx  the whole app (builder + live preview)
```

## Notes

- No backend required — "Send" opens `wa.me` (WhatsApp) or a `mailto:` link
  pre-filled with the order, so orders land wherever you tell it to.
- The embed snippet on the "Add to site" tab is illustrative; wire
  `data-*` attributes up to a real embed script if you want this to run on
  external sites as an actual `<script>` tag.
