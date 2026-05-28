# ArchFlow

Time tracking and project management app for architecture professionals. Built as a free, local-first alternative to Toggl Track.

## Features

- **Timer** — Real-time play/stop timer with localStorage persistence
- **Manual Entry** — Log hours by date, start/end time, project, and part
- **Projects & Parts** — Organize work into projects with subdivisions (kitchen, bathroom, 3D, CAD, meetings, etc.)
- **Weekly Dashboard** — Bar charts (hours/day), pie charts (by project), and part breakdown with week navigation
- **Reports** — Filter by period, export to PDF and CSV
- **Invoices** — Create from time entries, workflow (draft → sent → approved → paid), PDF export
- **Multi-profile** — Switch between profiles with isolated data
- **Desktop App** — Electron wrapper for macOS and Windows

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Prisma + SQLite (local file) |
| Charts | Recharts |
| Desktop | Electron |
| Tests | Vitest |
| Validation | Zod |

## Quick Start (Web — no installer)

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed

### Steps

```bash
# Clone the repo
git clone https://github.com/franciscoaero/archflow.git
cd archflow

# Install dependencies
npm install

# Create the database
npx prisma db push

# (Optional) Load sample data
npm run db:seed

# Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Desktop App (macOS)

### Option A: Download the installer

Go to the [Releases](https://github.com/franciscoaero/archflow/releases) page and download the `.dmg` file. Open it and drag ArchFlow to your Applications folder.

### Option B: Build locally

```bash
# Clone and install
git clone https://github.com/franciscoaero/archflow.git
cd archflow
npm install

# Build the desktop app
npm run electron:build
```

The `.dmg` file will be in the `dist/` folder. Double-click to install.

### Option C: Run in development mode

```bash
npm run electron:compile
npm run electron:dev
```

This opens the desktop window pointing to the local dev server.

## Desktop App (Windows)

### Option A: Download the installer

Go to the [Releases](https://github.com/franciscoaero/archflow/releases) page and download the `.exe` installer or the portable `.exe`.

### Option B: Build locally

```bash
# Clone and install
git clone https://github.com/franciscoaero/archflow.git
cd archflow
npm install

# Build the desktop app
npm run electron:build
```

The installer will be in the `dist/` folder.

### Option C: Run in development mode

```bash
npm run electron:compile
npm run electron:dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web app (http://localhost:3000) |
| `npm run build` | Production build of web app |
| `npm test` | Run unit tests |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Load sample data |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `npm run electron:dev` | Run desktop app in dev mode |
| `npm run electron:build` | Build desktop installer (.dmg / .exe) |

## Project Structure

```
archflow/
├── app/                  # Next.js pages and API routes
│   ├── api/              # REST endpoints (projects, entries, invoices, etc.)
│   ├── timer/            # Timer page
│   ├── projects/         # Project management page
│   ├── reports/          # Reports page
│   ├── invoices/         # Invoices page
│   └── profile/          # Profile settings page
├── components/           # React components
│   └── ui/               # shadcn/ui primitives
├── lib/                  # Utilities, Prisma client, PDF export
├── prisma/               # Database schema and seed
├── electron/             # Electron main/preload process
├── __tests__/            # Unit tests
└── resources/            # App icons for Electron build
```

## Data Storage

All data is stored locally in a SQLite file (`prisma/dev.db`). No data is sent to any server or cloud service. Your hours, projects, and invoices stay on your machine.

## License

MIT
