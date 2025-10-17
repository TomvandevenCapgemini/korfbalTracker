FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
# install all deps for build (including devDependencies)
RUN npm ci
COPY . .
# generate prisma client and build
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
# install only production deps in final image
RUN npm ci --production --no-audit --no-fund
# copy built artifacts and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["sh","-c","npx prisma db push --schema=prisma/schema.prisma && node dist/index.js"]
