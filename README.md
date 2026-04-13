# TalkTherapy

## Starting in local

To install both web and server dependencies:

```bash
bun install
```

To migrate sql:

```bash
cd server
# If prisma is not yet setup,
bunx --bun prisma init
# Generate Prisma Client
bunx --bun prisma generate
# Migrate the DB
bunx --bun prisma migrate dev
# If error occurs, reset the DB and try again
bunx --bun prisma migrate reset
# Seed the DB
bun run seed
```

Setting up Better-Auth
https://better-auth.com/docs/installation

```bash
# Generate table
bun x auth@latest generate
# Migrate the DB
bun x auth@latest migrate
```

To start the development server run:

```bash
bun run dev
```

To generate certs for HTTPS (required for WebRTC):

```bash
mkcert -install
mkcert localhost

# Generate certs
mkcert -key-file key.pem -cert-file cert.pem localhost
```
