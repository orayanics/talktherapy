# TalkTherapy

## Overview

**TalkTherapy** is a telehealth platform designed for Speech-Language Pathology (SLP) clinicians and patients.

Originally developed for **UST-CRS** to meet academic requirements, the platform addresses two primary needs:

- Assisting clinicians with diagnosis and assessment workflows
- Providing patients with a streamlined way to book appointments based on availability and convenience

## Core Features

- Clinician scheduling system
- Appointment booking system
- Admin user management
- Content management system (CMS)
- One-on-one video conferencing with integrated chat

## Technology Stack

### Backend

- **Bun\***
- **ElysiaJS**
- **Prisma**
- **SQLite**
- **NodeMailer**
- **Zod**

### Frontend

- **TanStack Start** (Query, Router)
- **Axios**
- **Tailwind CSS**
- **Zod**
- **React Hook Form**
- **Better Auth**

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

To run the Python script for phoneme analysis:

```bash
python3 -m venv slp-env
source slp-env/bin/activate
```

```bash
uvicorn service:app --host 0.0.0.0 --port 8000 --reload
```
