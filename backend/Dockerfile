FROM node:22-slim

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src/ ./src/
COPY db/ ./db/

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
