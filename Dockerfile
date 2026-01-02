# Frontend Dockerfile - Production Build
FROM node:20-alpine

# Install bun
RUN apk add --no-cache curl bash && \
    curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun /usr/local/bun

ENV PATH="/usr/local/bun/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Set build-time environment variable
ENV NEXT_PUBLIC_API_URL=http://host.docker.internal:8000/api/v1

# Build the application for production
RUN bun run build

# Expose port
EXPOSE 3000

# Start production server (stable, no Turbopack)
CMD ["bun", "run", "start"]