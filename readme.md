# SCRIBBLE & CO.

An animated handwriting signature generator and public Showcase gallery. Type any name, customize pen physics and cursive styles, export in high definition, and publish to the live Showcase wall.

---

## ⚡ Features

- **Live Handwriting Engine**: Renders realistic stroke-by-stroke signature animations with dynamic pen speed, pressure curves, and slant.
- **Cursive Font Library**: Supports Hershey single-stroke vector scripts and Google Cursive fonts (*Brittany*, *Signatura*, *Mrs Saint Delafield*, *Allura*, *Great Vibes*, *Sacramento*, *Parisienne*).
- **Studio Controls**: Tweak ink color, stroke width, slant angle, letter shakiness, and animation speed in real-time.
- **Export Formats**: Download signatures as transparent **PNG**, **SVG**, or high-definition 60fps **WebM** video.
- **Showcase Gallery**: Share and publish signatures to a public wall with live replay cards and pagination.
- **Monochrome Dark UI**: Single-window viewport designed with `#000000` monochrome aesthetic.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, HTML5 Canvas API, Lucide Icons |
| **Backend** | Node.js, Express 5, Neon PostgreSQL (`pg`), Helmet, Rate Limiter |
| **Database** | Neon PostgreSQL (Serverless DB) |

---

## 📂 Project Structure

```text
autograph/
├── client/     # Vite + React frontend studio & showcase app
└── server/     # Express REST API & PostgreSQL database pool
```

---

## 🚀 Getting Started

### 1. Server Setup

```bash
cd server
npm install
npm run dev
```

Create `server/.env`:
```env
PORT=5001
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
CORS_ORIGIN=http://localhost:5173
```

### 2. Client Setup

```bash
cd client
npm install
npm run dev
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/signatures?page=1&limit=10` | Fetch published signatures (paginated) |
| `GET` | `/api/signatures/:id` | Fetch single signature by ID |
| `POST` | `/api/signatures` | Publish signature (`name`, `style`, `seed`, `settings`) |
| `GET` | `/health` | Server health check |

