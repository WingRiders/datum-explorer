FROM ubuntu:22.04 AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y curl build-essential unzip wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.3"
ENV PATH="/root/.bun/bin:${PATH}"

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain nightly-2024-11-28 && \
    . $HOME/.cargo/env && \
    echo 'source $HOME/.cargo/env' >> $HOME/.bashrc
ENV PATH="/root/.cargo/bin:${PATH}"

COPY package.json bun.lock turbo.json ./

COPY app/ ./app/
COPY lib/ ./lib/

# Install all dependencies for build
RUN bun install --frozen-lockfile

RUN bun run build --filter=./app

# Install only production dependencies after build
RUN bun install --production --frozen-lockfile

FROM oven/bun:1.2.3-slim

WORKDIR /app

COPY --from=builder /app/app/.next ./.next
COPY --from=builder /app/app/package.json ./package.json
COPY --from=builder /app/app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules ./node_modules

CMD ["bun", "run", "start"]
