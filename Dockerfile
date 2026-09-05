# ─── Stage 1: install dependencies ───────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
# Install all deps (including devDeps needed for build)
RUN npm ci --legacy-peer-deps

# ─── Stage 2: build the Next.js app ──────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build (skip DB migration — runs at container start)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Placeholder DB URL so Prisma can instantiate during build (no real DB needed)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV BETTER_AUTH_SECRET="build-time-placeholder-secret-32chars!!"
ENV BETTER_AUTH_URL="http://localhost:3000"

RUN npm run build -- --no-lint 2>/dev/null || npx next build

# ─── Stage 3: minimal production runtime ─────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 2>/dev/null || true

# Copy Prisma for runtime migrations
COPY --from=builder /app/node_modules/.prisma        ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma        ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma         ./node_modules/prisma
COPY --from=builder /app/prisma                      ./prisma
COPY --from=builder /app/package.json                ./package.json

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run DB migrations then start the app
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
