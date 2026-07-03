FROM oven/bun:latest AS base

WORKDIR /app

# Copy only what's needed: ws-server source + db generated Prisma client
COPY ws-server/package.json ws-server/bun.lock* ws-server/
COPY db/generated/prisma/ db/generated/prisma/

RUN cd ws-server && bun install

COPY ws-server/ ws-server/

EXPOSE 3002

CMD [ "bun", "run", "--cwd", "ws-server", "start" ]
