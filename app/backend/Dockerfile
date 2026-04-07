FROM node:20-alpine

# Prisma needs OpenSSL on Alpine to run its schema engine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build
# Ensure the OpenAPI spec is reachable from dist/
COPY openapi.yaml ./openapi.yaml

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
