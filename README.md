# NST Executive Scheduler

> A premium, offline-first personal scheduling web app — installable as a PWA on any device.

![NST Executive Scheduler](icons/icon-192.png)

---

## Features

- **Appointments** — full CRUD with categories, times, locations, client linking, and file attachments
- **Recurring Series** — 10 frequency types (daily, weekdays, weekly, bi-weekly, monthly, quarterly, yearly, and more) with a dedicated Series Manager
- **Clients** — contact book with status tracking (Active / VIP / Prospect / Inactive) and appointment history
- **Tasks** — priority-based to-do list with filters and progress tracking
- **Analytics** — appointment breakdowns by category and month, top clients, task priorities
- **7 Themes** — Tan (default), Obsidian, Ivory, Midnight, Forest, Crimson, Slate
- **Offline-first** — fully functional with no internet connection after first load
- **Installable PWA** — add to home screen on iOS, Android, and desktop

---

## File Structure

```
├── nst_pro_v9.html        # Main application (single-file HTML/CSS/JS)
├── manifest.webmanifest   # PWA manifest
├── service-worker.js      # Offline caching service worker
├── icons/
│   ├── icon-192.png       # App icon (192×192)
│   └── icon-512.png       # App icon (512×512)
└── README.md
```

---

## Hosting on GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to `main` branch, root folder `/`
4. Click **Save** — your app will be live at:
   ```
   https://<your-username>.github.io/<repo-name>/nst_pro_v9.html
   ```

> **Important:** GitHub Pages serves over HTTPS, which is required for PWA install and service workers to work.

---

## Installing as a PWA

### iPhone / iPad (iOS 16.4+)
1. Open the app URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

### Android (Chrome)
1. Open the app URL in **Chrome**
2. Tap the **⋮** menu → **"Add to Home Screen"** (or look for the install banner)
3. Tap **Install**

### Desktop (Chrome / Edge)
1. Open the app URL
2. Click the **install icon** (⊕) in the address bar
3. Click **Install**

---

## Data & Privacy

All data is stored **locally on your device** using `localStorage`. Nothing is sent to any server.

| Storage Key     | Contents              |
|-----------------|-----------------------|
| `NST_ITEMS`     | Appointments array    |
| `NST_TODOS`     | Tasks array           |
| `NST_CLIENTS`   | Clients array         |
| `NST_THEME`     | Active theme name     |

To back up your data: open the browser console and run:
```js
JSON.stringify({
  items: JSON.parse(localStorage.NST_ITEMS || '[]'),
  todos: JSON.parse(localStorage.NST_TODOS || '[]'),
  clients: JSON.parse(localStorage.NST_CLIENTS || '[]')
})
```
Copy the output and save it somewhere safe.

---

## Offline Behaviour

The service worker uses a **cache-first, stale-while-revalidate** strategy:

1. On first load, all app assets are pre-cached
2. Subsequent loads are served instantly from cache
3. Cache is refreshed silently in the background when online
4. The app works fully offline — your data lives in `localStorage`

---

## Keyboard Shortcuts

| Key | Action              |
|-----|---------------------|
| `N` | New appointment     |
| `Esc` | Close any modal   |

---

## Customisation

To update the app version in the service worker cache after making changes, increment `CACHE_NAME` in `service-worker.js`:

```js
const CACHE_NAME = 'nst-scheduler-v2'; // bump this
```

---

## License

Personal use. Not for redistribution.
