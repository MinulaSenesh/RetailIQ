# Build stage
FROM node:20-alpine AS build
ARG VITE_API_BASE_URL=https://retailiq-api-production.up.railway.app/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# CACHEBUST forces a fresh build on every deploy (prevents stale layer caching)
ARG CACHEBUST=1
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -f .env .env.local .env.production .env.development
RUN VITE_API_BASE_URL=https://retailiq-api-production.up.railway.app/api/v1 npm run build

# Run stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
# Custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
