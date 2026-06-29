FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS development
RUN npm install
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
RUN npm install --omit=dev
COPY src/ ./src/
COPY public/ ./public/

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public

USER node
EXPOSE 3000
CMD ["node", "src/server.js"]