# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy everything from builder to preserve structure and dependencies
COPY --from=builder /app ./

EXPOSE 8000

CMD ["node", "dist/src/index.js"]