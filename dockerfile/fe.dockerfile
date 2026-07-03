FROM oven/bun:latest AS base

WORKDIR /app

COPY frontend/package.json frontend/bun.lock* frontend/

RUN cd frontend && bun install

COPY frontend/ frontend/

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN cd frontend && bun run build

EXPOSE 3000

CMD [ "bun", "run", "--cwd", "frontend", "start" ]
