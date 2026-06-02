# AGENTS.md

This document provides a comprehensive overview of the Work Tracker project architecture for developers and future AI agents working on this codebase.

## Project Overview

A secure, persistent Work Tracker designed for field workers, allowing multiple devices to synchronize, register, and update active jobs.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (Vinxi underneath) |
| Frontend | React 19, TanStack Router v1 |
| Styling | Tailwind CSS 4 |
| Database | Netlify Database (Managed PostgreSQL) |
| ORM / Migrations | Drizzle ORM (using `drizzle-orm@beta` and `drizzle-kit@beta`) |
| Validation | Zod |
| Language | TypeScript 5 (Strict Mode) |

---

## Directory Structure

```
├── db
│   ├── index.ts               # Drizzle client configuration (Netlify Database adapter)
│   └── schema.ts              # PostgreSQL schema definitions (users and work_items)
├── netlify
│   └── database
│       └── migrations         # Generated SQL migration files for the platform
├── src
│   ├── routes
│   │   ├── __root.tsx         # TanStack Router root document (injects global CSS and header title)
│   │   └── index.tsx          # Main application page (fully handles Auth and Tracker CRUD interface)
│   ├── server
│   │   └── tracker.functions.ts # Type-safe TanStack Start server functions (auth, sessions, DB CRUD)
│   ├── router.tsx             # Router initialization
│   └── styles.css             # Tailwind 4 global styles
├── README.md                  # Setup and usage guide
├── AGENTS.md                  # This file (AI developer map)
├── drizzle.config.ts          # Drizzle kit configuration (directs migrations to netlify/database/migrations)
├── netlify.toml               # Build and dev deployment specifications
└── package.json               # Package manifests and dependency controls
```

---

## Database Schema (`db/schema.ts`)

### `users` Table
- `id` (`serial`): Primary Key.
- `username` (`text`): Unique, lowercased, not null.
- `passwordHash` (`text`): Scrypt-derived password hash with a salt, formatted as `salt:hash`.
- `createdAt` (`timestamp`): Defaulting to current timestamp.

### `work_items` Table
- `id` (`serial`): Primary Key.
- `customerName` (`customer_name`): Text, not null.
- `site` (`site`): Text, not null (location/branch/address).
- `status` (`status`): Text, not null ("Pending", "In Progress", "Completed", defaulting to "Pending").
- `whatsRequired` (`whats_required`): Text, not null.
- `whereNeedsMeasuring` (`where_needs_measuring`): Text, not null.
- `notes` (`notes`): Text, nullable.
- `createdAt` (`created_at`): Defaulting to current timestamp.
- `updatedAt` (`updated_at`): Updated to current timestamp on any mutation.

---

## Authentication & Security Design

- **Zero-Dependency Security:** All cryptography utilizes standard Node.js native `crypto` modules (`scryptSync` for slow password hashing, `createCipheriv`/`createDecipheriv` with `aes-256-gcm` for authenticated session token encryption). This prevents native compilation issues in serverless or virtual environments.
- **Session Tokens:** Stateless, AES-GCM encrypted strings containing user details and expiration timestamps. Stored in a secure `httpOnly` browser cookie named `work_tracker_session`.
- **Pre-Seeded Teams:** To guarantee immediate multi-user functionality without administrative delays, the server automatically seeds the database with two default accounts (`admin` and `user`, both with password `tracker123`) if the `users` table is completely empty on any access check.
- **Open Registration:** Teammates can also register custom accounts via the client registration tab.

---

## Coding & Architectural Conventions

- **Server Functions (`.functions.ts`):** All database, authentication, and security logic resides on the server. Client-to-server RPCs are handled via TanStack Start's `createServerFn`.
- **Strict Input Validation:** All server functions must validate their payload using Zod schemas attached to `.inputValidator(...)`.
- **Database Migrations:** Never modify applied migrations. Any schema modification to `db/schema.ts` requires running `npx drizzle-kit generate` to generate the new SQL migration script. Migrations are applied automatically by Netlify at deploy-time.
- **Responsive Fluid Interface:** The frontend layout uses Tailwind flex/grid patterns ensuring that a table view collapses gracefully into interactive cards on viewport widths below 768px (for seamless smartphone usage in the field).
