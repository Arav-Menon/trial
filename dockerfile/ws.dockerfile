FROM oven/bun:latest AS base

WORKDIR /app

# Copy db package (schema + deps) to generate Prisma client
COPY db/package.json db/bun.lock* db/
COPY db/prisma db/prisma

RUN cd db && bun install

RUN cd db && bunx prisma generate

# Copy ws-server deps first for layer caching
COPY ws-server/package.json ws-server/bun.lock* ws-server/

RUN cd ws-server && bun install

COPY ws-server/ ws-server/

RUN groupadd -r bungroup && \
    useradd -r -g bungroup bunuser

# Give ownership
RUN chown -R 1001:1001 /app

USER 1001

EXPOSE 3002

CMD [ "bun", "run", "--cwd", "ws-server", "start" ]
