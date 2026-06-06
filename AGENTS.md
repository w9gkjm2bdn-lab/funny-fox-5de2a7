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
- `isAdmin` (`boolean`): Admin privileges flag, defaults to `false`. Admin users have elevated permissions for system management.
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
- **Session Tokens:** Stateless, AES-GCM encrypted strings containing user details, admin status, and expiration timestamps. Stored in a secure `httpOnly` browser cookie named `work_tracker_session`.
- **Pre-Seeded Admin Accounts:** To guarantee immediate multi-user functionality without administrative delays, the server automatically seeds the database with default admin accounts if the `users` table is completely empty. See **Default Accounts** section below.
- **Open Registration:** Team members can register custom accounts via the client registration tab. New registrations default to standard user privileges (non-admin).
- **Admin Privileges:** Admin users are designated by the `isAdmin` flag and can perform system management tasks. The `isAdmin` status is included in encrypted session tokens for authorization checks.

---

## Default Accounts

On first deployment or when the `users` table is empty, two admin accounts are automatically created:

1. **Tom** - Admin account
2. **Chris** - Admin account

These accounts are created programmatically in the `ensureDefaultUsers()` function in `src/server/tracker.functions.ts`. Contact your administrator for account access credentials.

---

## Coding & Architectural Conventions

- **Server Functions (`.functions.ts`):** All database, authentication, and security logic resides on the server. Client-to-server RPCs are handled via TanStack Start's `createServerFn`.
- **Strict Input Validation:** All server functions must validate their payload using Zod schemas attached to `.inputValidator(...)`.
- **Database Migrations:** Never modify applied migrations. Any schema modification to `db/schema.ts` requires running `npx drizzle-kit generate` to generate the new SQL migration script. Migrations are applied automatically by Netlify at deploy-time.
- **Responsive Fluid Interface:** The frontend layout uses Tailwind flex/grid patterns ensuring that a table view collapses gracefully into interactive cards on viewport widths below 768px (for seamless smartphone usage in the field).
- **Login Page Security:** The login page should never display example credentials or default account information. Users should contact administrators for account setup and access.

---

## Development Workflow

### Running Locally
```bash
npm install
npx netlify dev --port 8889
```

### Database Schema Updates
1. Modify schema in `db/schema.ts`
2. Run: `npx drizzle-kit generate`
3. Review generated migration in `netlify/database/migrations/`
4. Commit and push changes

### Environment Variables
The following environment variable should be configured in your Netlify deployment settings:
- `SESSION_SECRET`: A secure encryption key for session tokens (min 32 characters). Falls back to a default if not configured, but production deployments should always set this explicitly.

---

## Security Best Practices

- **Credentials:** Never hardcode, display, or commit user credentials in the UI, documentation, or configuration files.
- **Environment Variables:** Sensitive values like `SESSION_SECRET` must be stored in Netlify environment settings, never in version control.
- **Admin Flag:** Use the `isAdmin` column to gate administrative functionality on both frontend and backend.
- **Password Hashing:** All passwords are hashed using scrypt with random salt. Never store or transmit plaintext passwords.
- **Session Expiration:** Session tokens expire after 30 days and are verified with AES-GCM authentication.
