FROM oven/bun:latest AS base

WORKDIR /app

COPY frontend/package.json frontend/bun.lock* frontend/

RUN cd frontend && bun install

COPY frontend/ frontend/

RUN cd frontend && bun run build

EXPOSE 3000

CMD [ "bun", "run", "--cwd", "frontend", "start" ]
