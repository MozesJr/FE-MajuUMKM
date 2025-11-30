# Chatbot_Frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# copy only package files first for caching
COPY package*.json ./

RUN npm ci

# copy the rest of the frontend code
COPY . .

EXPOSE 3000

# Vite harus bind ke 0.0.0.0 agar dapat diakses dari host/container network
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 3000"]
