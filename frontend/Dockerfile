FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production --no-audit --no-fund
# copy built dist from builder
COPY --from=builder /app/dist ./dist
EXPOSE 5173
CMD ["npx", "vite", "preview", "--port", "5173", "--host"]
