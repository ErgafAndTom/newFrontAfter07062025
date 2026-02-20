# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PrintPeaks — React SPA for print shop management: product calculators, CRM, order management, and integrations with Ukrainian business services (Nova Poshta, Checkbox/PRRO fiscal system, Telegram).

## Commands

```bash
npm start          # Dev server (CRA, port 3000). ESLint disabled via DISABLE_ESLINT_PLUGIN=true
npm run build      # Production build
npm test           # Jest via react-scripts test
```

Backend must be running on `localhost:5555` (proxy configured in `package.json` and `src/setupProxy.cjs`).

## Tech Stack

- **React 18.2** (JavaScript, minimal TypeScript)
- **Create React App** (react-scripts 5.0.1)
- **Redux + Redux Thunk** for state management (traditional pattern, not RTK Query)
- **React Router v6** for routing
- **MUI v5** + Bootstrap + Emotion + Styled Components (mixed styling)
- **Axios** with token interceptor (`src/api/axiosInstance.js`)
- **Socket.io** for real-time updates (WebSocket proxy at `/ws/uploads`)

## Architecture

### State Management
- Store: `src/stores/store.js`
- Reducers: `src/reducers/` — auth, prices, files, currentUser, invoices, trello, search, telegram, counter
- Actions: `src/actions/` — traditional action creators with thunks

### Routing
- Main router: `src/components/AllWindow.js`
- Route definitions: `src/PrintPeaksFAinal/AfterNav.js`
- `/` → Calculator, `/login` → Auth, `/admin` → CRM, plus 20+ feature routes

### API Layer
- Base axios instance: `src/api/axiosInstance.js` (auto-attaches JWT from localStorage)
- Service files: `src/api/` — counterpartyApi, invoiceService, paymentsApi, pos, prro

### Key Source Directories
- `src/PrintPeaksFAinal/` — Main UI module containing most feature areas:
  - `poslugi/` — 15+ print product calculators (booklets, cups, magnets, wide format, etc.)
  - `Orders/` — Order management
  - `checkbox/` — POS/fiscal register integration
  - `novaPoshta/` — Shipping integration
  - `telegram/` — Telegram bot integration
  - `user/` — User management
  - `Storage/` — Inventory/warehouse
  - `trelloLikeBoards/` — Kanban boards
- `src/components/` — Shared components, admin CRM (`admin/crm/`), legacy calculators (`calc/`)
- `src/hooks/` — Custom hooks (useInterfaceAgent, useTelegramNotifications, useTelegramWS)
- `src/utils/` — Helpers (dateUtils, discount, numberToWords for Ukrainian, orderHelper)

## Code Conventions

- UI text and comments are in Ukrainian and English (mixed)
- ESLint is configured (`.eslintrc.js`) but disabled in build scripts
- PropTypes are not enforced
- Styling mixes MUI `sx` prop, CSS files, Emotion, and Styled Components — follow the pattern of the file being edited
