# Stage 1 : dépendances
FROM node:20-alpine as deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
# Stage 2 : production
FROM node:20-alpine as runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
#Securité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN apk add --no-cache curl
USER appuser

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s CMD curl -f "http://localhost:${PORT}/health" || exit 1
CMD [ "npm" , "run" ,"start" ]