# NFX Policies

A policy management and acknowledgement platform for organisations. Employees browse, read, and acknowledge company policies via a document viewer. Admins manage policies, track completion, and export reports.

## Features

**Employee portal**

- Browse and filter active policies (PDF & DOCX)
- In-browser document viewer with PDF and Word support
- One-click policy acknowledgement with confirmation modal
- Personal acknowledgement history
- Team-wide completion progress dashboard

**Admin portal**

- Create, publish, and version policies
- Upload documents to OneDrive via Microsoft Graph
- Dashboard with completion charts by department and policy
- Employee management
- Export acknowledgement reports as PDF

## Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Auth      | NextAuth v5 + Microsoft Entra ID (Azure AD SSO) |
| Database  | Supabase (PostgreSQL + RLS)                     |
| State     | Zustand 5, TanStack React Query 5               |
| Documents | pdfjs-dist 3, mammoth.js, jsPDF                 |
| Forms     | React Hook Form 7 + Zod 4                       |
| Charts    | Recharts 2                                      |
| Styling   | Tailwind CSS 4, Lucide React                    |
| Storage   | Microsoft OneDrive (Graph API)                  |

## Prerequisites

- Node.js ≥ 18.17.0
- A Supabase project
- A Microsoft Entra ID app registration (for SSO + Graph API)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in all values — see Environment Variables below

# 3. Apply database migrations
# Run the SQL files in supabase/migrations/ against your Supabase project

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Users are redirected to the employee or admin portal based on their role.

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth v5
AUTH_SECRET=                        # openssl rand -base64 32
NEXTAUTH_URL=                       # e.g. http://localhost:3000

# Microsoft Entra ID (Azure AD) — SSO login
AUTH_MICROSOFT_ENTRA_ID_ID=
AUTH_MICROSOFT_ENTRA_ID_SECRET=
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=

# Microsoft Graph API — OneDrive document storage
MICROSOFT_GRAPH_CLIENT_ID=
MICROSOFT_GRAPH_CLIENT_SECRET=
MICROSOFT_GRAPH_TENANT_ID=

# App
NEXT_PUBLIC_APP_URL=                # e.g. http://localhost:3000
```

> Admins are identified by matching their Azure AD email against `ADMIN_EMAILS` (comma-separated) set in your environment or Supabase config.

## Project Structure

```
app/
  (admin)/admin/       # Admin routes: dashboard, employees, policies, reports
  (auth)/login/        # Microsoft SSO login page
  (employee)/employee/ # Employee routes: policy list, viewer, acknowledgements, team, settings
  api/                 # Route handlers (auth, policies, acknowledge, team-stats, graph)

components/
  admin/               # Charts, tables, activity feed
  employee/            # Policy cards, acknowledge button, progress summary
  viewer/              # PDFViewer, DocxViewer, DocumentViewer
  ui/                  # Button, Modal, Badge, Card, Spinner, Toast, …

lib/
  auth/                # NextAuth configuration
  supabase/            # Browser and server Supabase clients
  graph/               # Microsoft Graph client
  onedrive/            # OneDrive upload helpers
  pdf/                 # Report generation (jsPDF)
  validations/         # Zod schemas

hooks/                 # usePolicies, useAcknowledgements, useTeamStats, useIsMobile, …
store/                 # Zustand stores (policy, UI, user)
supabase/migrations/   # SQL migration files
```

## Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Run Prettier
npm run type-check   # TypeScript type check
```

## Contributing

This project enforces [Conventional Commits](https://www.conventionalcommits.org/). Commit messages must match the pattern `type(scope): description`, e.g.:

```
feat(policies): add category filter pills
fix(pdf): resolve canvas SSR alias error
```

Husky runs ESLint + Prettier on staged files before every commit.
