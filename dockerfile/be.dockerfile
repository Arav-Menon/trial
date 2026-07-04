FROM oven/bun:latest AS base

WORKDIR /app

# Copy db package (schema + deps) to generate Prisma client
COPY db/package.json db/bun.lock* db/
COPY db/prisma db/prisma

RUN cd db && bun install

RUN cd db && bunx prisma generate

# Copy backend deps first for layer caching
COPY backend/package.json backend/bun.lock* backend/

RUN cd backend && bun install

COPY backend/ backend/

RUN groupadd -r bungroup && \
    useradd -r -g bungroup bunuser && \
    chown -R bunuser:bungroup /app

USER bunuser

EXPOSE 3001

CMD [ "bun", "run", "--cwd", "backend", "start" ]
