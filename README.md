# TalkTherapy

## Starting in local

To install both web and server dependencies:

```bash
bun install
```

To migrate sql:

```bash
bunx --bun prisma generate
bunx --bun prisma migrate dev
(if needed): bunx --bun prisma migrate reset
bun run seed
```

To start the development server run:

```bash
bun run dev
```
