FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS development
RUN npm install
COPY . .
USER node
CMD ["npm", "run", "dev"]

FROM base AS builder
RUN npm ci --only=production
COPY src/ ./src/

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src

USER node

CMD ["node", "src/worker.js"]