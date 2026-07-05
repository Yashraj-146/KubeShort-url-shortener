# ==================================================
# Stage 1 - Build
# ==================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN npm prune --omit=dev

# ==================================================
# Stage 2 - Runtime
# ==================================================
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk upgrade --no-cache

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]