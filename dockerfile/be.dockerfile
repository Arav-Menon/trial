FROM oven/bun:latest AS base

WORKDIR /app

# Copy only what's needed: backend source + db generated Prisma client
COPY backend/package.json backend/bun.lock* backend/
COPY db/generated/prisma/ db/generated/prisma/

RUN cd backend && bun install

COPY backend/ backend/

EXPOSE 3001

CMD [ "bun", "run", "--cwd", "backend", "start" ]
