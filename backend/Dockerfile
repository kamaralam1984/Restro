# Restro OS Backend - production
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# server.ts is at project root; run with tsx (no separate build step)
EXPOSE 5000

CMD ["npx", "tsx", "server.ts"]
