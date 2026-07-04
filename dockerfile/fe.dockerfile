FROM oven/bun:latest

WORKDIR /app

COPY frontend/package.json frontend/bun.lock* frontend/

RUN cd frontend && bun install

COPY frontend/ frontend/

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN cd frontend && bun run build

# Create non-root user
RUN groupadd -r bungroup && \
    useradd -r -g bungroup bunuser

# Give ownership
RUN chown -R 1001:1001 /app

USER 1001

EXPOSE 3000

CMD ["bun", "run", "--cwd", "frontend", "start"]