# itoolbox-web — static export served by nginx, for local and on-premise deployment.
#
# The app imports the shared API contract via the @itoolbox/ui/* alias, which
# tsconfig.json maps to ./packages/ui/*, so packages/ must be copied in before
# the build step or the build fails with a misleading implicit-any error.
#
#   docker build -f Dockerfile .
#
# NEXT_PUBLIC_* values are baked in at BUILD time by Next's static export — they
# are not read at runtime. Hence build args rather than environment variables: an
# image must be built pointing at the API the browser will reach, and cannot be
# repointed afterwards by changing the container's environment.

# ── Build ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /repo

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_PORT
ARG NEXT_PUBLIC_APP_ENV

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_API_PORT=$NEXT_PUBLIC_API_PORT \
    NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NODE_ENV=production

# .npmrc sets legacy-peer-deps=true; keep it with the lockfile so npm ci resolves
# peers the same way the lockfile was written.
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# The shared contract must land before the build; the app will not typecheck
# without it.
COPY packages/ ./packages/
COPY . .

# next.config.ts switches to output:"export" when NODE_ENV is production, so this
# writes a fully static site to /repo/out.
RUN npm run build

# ── Serve ─────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=build /repo/out /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
