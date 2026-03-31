# Ruqyah Healing

Astro 6 site for Ruqyah Healing Center. The appointment flow now saves booking data to Neon via Drizzle before opening WhatsApp handoff.

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Run Astro dev server |
| `npm run build` | Build production assets |
| `npm run preview` | Preview the built site |
| `npm run pages:dev` | Build and run Cloudflare Pages locally with `functions/` support |
| `npm run db:generate` | Generate Drizzle SQL migration from schema changes |
| `npm run db:push` | Push the current schema to Neon using `DATABASE_URL` |

## Appointment Persistence

Booking submissions from `/appointment` are sent to `functions/api/appointments.ts`.

Saved fields include:

- Patient details
- Service mode and session format
- Treatment type and selected sub-services
- Contact information
- Problem summary
- Payment details
- Booking status and created timestamp

The endpoint validates the request with Zod, inserts into the `appointments` table through Drizzle, then the frontend opens WhatsApp with the saved booking ID.

## Neon Setup

1. Create a Neon Postgres database and copy its connection string.
2. Put the connection string in a local `.dev.vars` file:

```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

3. Push the schema:

```bash
npm run db:push
```

4. For Cloudflare Pages production, add the same value as the `DATABASE_URL` secret/environment variable.

## Local Verification

For local end-to-end testing of the booking API, use:

```bash
npm run pages:dev
```

That serves the built site together with the `functions/` directory, which is closer to production than plain `astro dev`.
