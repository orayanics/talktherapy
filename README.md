# TalkTherapy

## Starting in local

To install both web and server dependencies:

```bash
bun install
```

To migrate sql:

```bash
cd server
# Generate Prisma Client
bunx --bun prisma generate
# Migrate the DB
bunx --bun prisma migrate dev
# If error occurs, reset the DB and try again
bunx --bun prisma migrate reset
# Seed the DB
bun run seed
```

To start the development server run:

```bash
bun run dev
```
