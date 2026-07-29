# Stage 1: Build React frontend app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Express API & Database Server
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server/index.js"]
