FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma/

RUN npm install

COPY backend/ ./

RUN npx prisma generate
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --module commonjs --target es2020 --moduleResolution node

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV PORT=5000
ENV NODE_ENV=production
ENV DATABASE_URL="file:./dev.db"
ENV JWT_SECRET="durga_enterprise_super_secret_jwt_key_2026"

COPY backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node dist/prisma/seed.js && npm start"]
