# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Custom nginx config for SPA routing inside the container can be added here
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
