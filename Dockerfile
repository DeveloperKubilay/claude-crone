FROM node:20-bookworm-slim

# Set non-interactive frontend
ENV DEBIAN_FRONTEND=noninteractive
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install Python3, curl, git, and necessary system dependencies for Playwright Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    curl \
    git \
    ca-certificates \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxss1 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI, Playwright, and official Playwright MCP Server globally
RUN npm install -g @anthropic-ai/claude-code playwright @playwright/mcp

# Install Playwright Chromium browser into shared directory
RUN mkdir -p /ms-playwright && \
    npx playwright install --with-deps chromium && \
    chmod -R 777 /ms-playwright

# Setup app directory
WORKDIR /app

# Install package dependencies
COPY package*.json ./
RUN npm install

# Setup non-root user (node) environment for Claude Code CLI
RUN mkdir -p /home/node/.claude && \
    echo '{"mcpServers":{"playwright":{"command":"npx","args":["-y","@playwright/mcp@latest"]}}}' > /home/node/.claude/mcp.json

# Copy application files
COPY . .

# Adjust permissions for non-root user
RUN chown -R node:node /app /home/node

# Switch to non-root user (required by Claude Code CLI for --dangerously-skip-permissions)
USER node

# Default environment variables
ENV NODE_ENV=production
ENV CHECK_INTERVAL_HOURS=24

CMD ["node", "scheduler.js"]
