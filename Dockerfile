FROM node:20-bookworm-slim

# Set non-interactive frontend
ENV DEBIAN_FRONTEND=noninteractive

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

# Install Claude Code CLI, Playwright, and Playwright MCP Server globally
RUN npm install -g @anthropic-ai/claude-code playwright @modelcontextprotocol/server-playwright

# Setup app directory
WORKDIR /app

# Install package dependencies
COPY package*.json ./
RUN npm install

# Install Playwright Chromium browser and its system dependencies
RUN npx playwright install --with-deps chromium

# Ensure Claude config directories exist and pre-configure Playwright MCP
RUN mkdir -p /root/.claude && \
    echo '{"mcpServers":{"playwright":{"command":"npx","args":["-y","@modelcontextprotocol/server-playwright"]}}}' > /root/.claude/mcp.json

# Copy application files
COPY . .

# Default environment variables
ENV NODE_ENV=production
ENV CHECK_INTERVAL_HOURS=24

CMD ["node", "scheduler.js"]
