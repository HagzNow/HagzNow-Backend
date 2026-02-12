# ---------- Build stage ----------
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

RUN mkdir -p /app/uploads/users /app/uploads/arenas /app/uploads/auth /app/uploads/bookings /app/uploads/ads /app/uploads/reviews /app/uploads/categories && \
    chown -R node:node /app/uploads && \
    chmod -R 755 /app/uploads


RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
