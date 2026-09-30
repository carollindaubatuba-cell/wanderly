# Wanderly — Travel Planner

Your trip. Your plans. Your adventure.

A private travel planner that runs entirely in the browser. No login, no backend, no database.
All data is saved to `localStorage` on the customer's device.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```

## Build
```bash
npm run build          # -> dist/          (for Vercel or any static host)
npm run build:single   # -> dist-single/index.html (one self-contained file)
```

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. In Vercel: Add New > Project > import the repo.
3. Vercel detects Vite automatically (Build: `npm run build`, Output: `dist`). Click Deploy.

Or with the CLI: `npm i -g vercel && vercel --prod`.

## Structure
```
src/
  components/  ui.jsx (Button, Card, Modal, Toast, Input, Select, DatePicker, EmptyState, ProgressBar…)
               cards.jsx (TripCard, ActivityCard, BookingCard, BudgetCard, PackingItem, PlaceCard, NoteCard…)
               forms.jsx, Shell.jsx, SearchModal.jsx, PrintView.jsx, Cover.jsx, Page.jsx
  pages/       Welcome, Dashboard, MyTrips, TripOverview, Itinerary, Budget, Bookings,
               Packing, Places, Notes, Documents, Emergency, TripSettings, Settings
  hooks/       useStore.jsx   (state, routing, localStorage persistence)
  utils/       calc.js (durations, countdown, budget, progress), dates.js, format.js,
               schema.js (data validation), validate.js (form validation), storage.js, io.js
  data/        constants.js, defaults.js, demo.js
  styles/      index.css
```

## Storage keys
`wanderly_trips`, `wanderly_settings`, `wanderly_current_trip`

## Notes
- Fonts (DM Sans, Playfair Display) load from Google Fonts with system fallbacks.
  The app still works fully offline or if fonts are blocked.
- Export/Import uses JSON; imports are validated and added as new trips.
