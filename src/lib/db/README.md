# Data layer

This folder will hold batch storage and retrieval.

**Suggested approach:**

1. **MVP:** In-memory store or JSON file + API routes in `src/app/api/` so the app works without a database.
2. **Later:** Add a real database (e.g. SQLite with Drizzle/Prisma, or Postgres) and move logic here.

Keep API routes in `src/app/api/batches/`, `src/app/api/checks/`, etc., and call into this layer so the app stays testable and easy to swap storage.
