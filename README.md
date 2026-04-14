# OneCreations

OneCreations is a monorepo for the brand website and notify backend.

## Project structure

- web: Next.js frontend for landing pages, products, VFX, and diecast sections.
- api: Express + MongoDB backend for notify-me submissions.

## Prerequisites

- Node.js 20 or newer
- npm

## Install dependencies

```bash
npm run install:all
```

## Run locally

```bash
npm run dev
```

Services:

- Web: http://localhost:3000
- API: http://localhost:4000

## Environment variables

API environment file at api/.env:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
```

Web optional environment file at web/.env.local:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Useful scripts

From repository root:

- npm run dev: run web and api together
- npm run build: build api and web
- npm run typecheck: typecheck api and web

## Notify endpoints

- POST /notify
- GET /notify/count?productId=<product-slug>
