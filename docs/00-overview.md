# NFX Policies — Project Overview

## Purpose

Enterprise HR Policy Acknowledgement System where employees authenticate via Microsoft (Azure AD), read company HR policy documents (PDF/DOCX stored in SharePoint/OneDrive), and formally acknowledge them. Admins track acknowledgement status across the organization with analytics and PDF reports. All activity is audit-logged in Supabase.

---

## Deployment

- **Target**: Vercel (Frontend + API) + Supabase Cloud (Database)
- **Auth Provider**: Microsoft Entra ID (Azure AD) via NextAuth.js v5
- **Document Storage**: Microsoft SharePoint / OneDrive via Microsoft Graph API

## Tech Stack

| Concern           | Package                                               | Version       |
| ----------------- | ----------------------------------------------------- | ------------- |
| Framework         | `next`                                                | 15.x          |
| Language          | `typescript`                                          | 5.x (strict)  |
| Auth              | `next-auth`                                           | ^5.0.0        |
| Microsoft Graph   | `@microsoft/microsoft-graph-client`                   | ^3.0.7        |
| Database          | `@supabase/supabase-js` + `@supabase/ssr`             | ^2.x / ^0.5.x |
| PDF Viewer        | `@react-pdf-viewer/core` + `pdfjs-dist`               | ^3.12 / ^4.x  |
| DOCX Viewer       | `mammoth`                                             | ^1.8.0        |
| HTML Sanitization | `dompurify` + `@types/dompurify`                      | ^3.x          |
| Client State      | `zustand`                                             | ^5.0.0        |
| Server State      | `@tanstack/react-query`                               | ^5.0.0        |
| Forms             | `react-hook-form` + `@hookform/resolvers`             | ^7.x / ^5.x   |
| Validation        | `zod`                                                 | ^4.0.0        |
| Styling           | `tailwindcss` + `@tailwindcss/postcss`                | ^4.x          |
| Linting           | `eslint` + `eslint-config-next`                       | ^9.x          |
| Formatting        | `prettier` + `prettier-plugin-tailwindcss`            | ^3.x          |
| Commit hooks      | `husky` + `lint-staged`                               | ^9.x / ^15.x  |
| Commit lint       | `@commitlint/cli` + `@commitlint/config-conventional` | ^19.x         |

---

## Folder Structure

```
nfx-policies/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── employees/
│   │       │   └── page.tsx
│   │       ├── policies/
│   │       │   └── page.tsx
│   │       └── reports/
│   │           └── page.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (employee)/
│   │   ├── layout.tsx
│   │   └── employee/
│   │       ├── acknowledgements/
│   │       │   └── page.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── policy/
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── settings/
│   │       │   └── page.tsx
│   │       └── team/
│   │           └── page.tsx
│   └── api/
│       ├── acknowledge/
│       │   └── route.ts
│       ├── admin/
│       │   └── policies/
│       │       └── route.ts
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── employees/
│       │   └── route.ts
│       ├── graph/
│       │   └── document/
│       │       └── route.ts
│       └── policies/
│           └── route.ts
├── components/
│   ├── admin/
│   │   ├── AckTable.tsx
│   │   ├── CompletionBarChart.tsx
│   │   ├── DeptPieChart.tsx
│   │   ├── RecentActivityFeed.tsx
│   │   └── StatsCards.tsx
│   ├── auth/
│   │   └── MicrosoftLoginButton.tsx
│   ├── employee/
│   │   ├── AcknowledgeButton.tsx
│   │   ├── PolicyCard.tsx
│   │   ├── PolicyGrid.tsx
│   │   └── ProgressSummary.tsx
│   ├── layout/
│   │   ├── AdminSidebar.tsx
│   │   ├── EmployeeSidebar.tsx
│   │   └── Header.tsx
│   ├── pdf/
│   │   └── ExportReportButton.tsx
│   ├── ui/
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   └── viewer/
│       ├── DocumentViewer.tsx
│       ├── DocxViewer.tsx
│       └── PDFViewer.tsx
├── docs/
│   ├── 00-overview.md
│   ├── 01-project-setup.md
│   ├── 02-design-tokens.md
│   ├── 03-auth.md
│   ├── 04-database.md
│   ├── 05-graph-integration.md
│   ├── 06-api-routes.md
│   ├── 07-ui-components.md
│   ├── 08-policy-feature.md
│   ├── 09-state-and-queries.md
│   └── 10-deployment.md
├── hooks/
│   ├── useAcknowledgements.ts
│   ├── useEmployeeStats.ts
│   ├── useGraphDocument.ts
│   ├── useIsMobile.ts
│   └── usePolicies.ts
├── lib/
│   ├── auth/
│   │   └── authOptions.ts
│   ├── graph/
│   │   └── graphClient.ts
│   ├── pdf/
│   │   └── generateReport.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── validations/
│       ├── acknowledgeSchema.ts
│       └── policySchema.ts
├── providers/
│   └── Providers.tsx
├── store/
│   ├── usePolicyStore.ts
│   ├── useUIStore.ts
│   └── useUserStore.ts
├── types/
│   ├── index.ts
│   └── next-auth.d.ts
├── utils/
│   └── helpers.ts
├── commitlint.config.js
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Coding Conventions

1. **No hardcoded colors or fonts** — use only CSS custom property tokens from `globals.css` via Tailwind classes
2. **TypeScript strict mode** — `noImplicitAny`, `strictNullChecks` enabled; no `any` types
3. **Zod validation at all boundaries** — API route inputs validated with Zod schemas; env vars validated at startup
4. **Feature-based folders** — code is organized by feature (`features/policies/`, `features/auth/`) not by type
5. **Server state via TanStack Query** — all API data fetching goes through Query hooks; no raw `fetch` in components
6. **UI state via Zustand** — only ephemeral state that does not need server sync (viewer open, sidebar state)
7. **No inline styles** — all styling via Tailwind utility classes mapped to design tokens
8. **Conventional Commits** — commit messages must follow `type(scope): subject` format

---

## State Management Guide

| What                   | Where                                  | Why                              |
| ---------------------- | -------------------------------------- | -------------------------------- |
| Policy list from API   | TanStack Query (`usePolicies`)         | Cacheable, background refetch    |
| User ack status        | TanStack Query (`useAcknowledgements`) | Cacheable                        |
| Submit acknowledgement | TanStack Mutation (`useAcknowledge`)   | Invalidates ack cache on success |
| Log read event         | TanStack Mutation (`useLogReadEvent`)  | Fire-and-forget mutation         |
| Viewer open/closed     | Zustand (`policyStore`)                | UI-only, no server sync needed   |
| Selected document      | Zustand (`policyStore`)                | UI-only                          |
| Sidebar collapsed      | Zustand or local state                 | UI-only                          |

---

## Docs Reading Order for Implementation

Implement in this order — each doc builds on the previous:

1. `01-project-setup.md` — scaffold the project
2. `02-design-tokens.md` — establish design system
3. `04-database.md` — set up Supabase schema
4. `03-auth.md` — authentication layer
5. `05-graph-integration.md` — Microsoft Graph services
6. `06-api-routes.md` — API route handlers
7. `07-ui-components.md` — shared UI components
8. `09-state-and-queries.md` — state management layer
9. `08-policy-feature.md` — feature components
10. `10-deployment.md` — deployment configuration
