# TalkTherapy

## Starting in local

To install both web and server dependencies:

```bash
bun run install
```

To migrate sql:

```bash
bunx --bun prisma migrate dev
bun run seed
```

To start the development server run:

```bash
bun run dev
```
