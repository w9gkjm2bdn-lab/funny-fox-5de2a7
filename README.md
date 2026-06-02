# Work Tracker

A secure, fully persistent, and multi-device Work Tracker web application designed to help teams capture, organize, and monitor jobs. It includes detailed work item records, user accounts, and real-time status reporting.

## Features

- **Persistent Job Registry:** Log and view critical details for each task:
  - Customer Name
  - Site Address / Location
  - Status (Pending, In Progress, Completed)
  - What's Required
  - Where Needs Measuring
  - Additional Notes
- **Multi-Device Syncing:** Hosted on Netlify with database storage, keeping information completely synced across mobile phones, tablets, and desktop computers.
- **Team Authentication:** Features robust, custom session-based user authentication. Out-of-the-box support for two pre-seeded user accounts, plus open registration for additional teammates.
- **Responsive Dashboard:** Includes visual KPI status counts, text-based search, status filters, and interactive modals for creating and updating work items.

## Technologies Used

- **Framework:** [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React 19, TypeScript)
- **Database:** Netlify Database (Managed Postgres)
- **Database ORM:** Drizzle ORM
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React

## Local Development

To run the application locally with full database replication and local Netlify features emulation:

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server with Netlify Dev:
   ```bash
   npx netlify dev --port 8889
   ```
4. Open the application in your browser at `http://localhost:8889`.

### Pre-Configured Test Credentials

For quick evaluation, you can log in using either of the following pre-seeded accounts:
- **Admin account:** username `admin`, password `tracker123`
- **Standard account:** username `user`, password `tracker123`
