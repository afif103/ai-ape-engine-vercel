# Frontend Dockerfile
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

# Expose port
EXPOSE 3000

# Start development server
CMD ["bun", "run", "dev", "--hostname", "0.0.0.0", "--port", "3000"]