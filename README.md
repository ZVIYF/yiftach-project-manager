# Yiftach Project Manager (v2.0)

A modular, secure Progressive Web Application (PWA) for construction and renovation management, built with Vite, strict TypeScript, Cloudflare Pages, and Firebase.

## Architecture Overview
- **Frontend:** Modular Single Page Application (Vite + TypeScript + CSS Modules / Design Tokens)
- **Typography & Locale:** Heebo Google Font with native RTL support (`dir="rtl"`, Hebrew interface)
- **Hosting:** Cloudflare Pages (Pure Static SPA)
- **Database & Auth:** Google Firebase (Cloud Firestore & Firebase Authentication)

## Project Structure
```text
├── src/
│   ├── core/              # Global configs, Firebase setup, SPA Router
│   ├── types/             # Strict TypeScript domain interfaces
│   ├── services/          # Client-side services
│   ├── modules/           # Domain feature modules (Auth, Projects, Finances, Debts)
│   ├── styles/            # RTL typography and design tokens
│   └── main.ts            # Application bootstrap
├── public/                # Static assets, PWA manifest, service worker, _redirects
├── scripts/               # Maintenance and migration tooling
└── vite.config.ts         # Vite build configuration
```

## Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Type check
npm run typecheck

# Build for Cloudflare Pages production
npm run build
```

## Security & Workflow Standards
- **Branching:** Work is partitioned into phase branches (`feature/phase-X`) and merged into `main` via Pull Requests.
- **Privacy:** Real customer and financial data is strictly confined to local storage and never committed to Git.
