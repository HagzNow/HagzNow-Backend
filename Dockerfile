# ---------- Build stage ----------
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM node:24-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm install --production

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
