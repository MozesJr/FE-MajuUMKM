# Chatbot_Frontend/backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# document the port backend will use (set via env)
EXPOSE 8061

# run the node server. server.js should read process.env.PORT
CMD ["sh", "-c", "node server.js"]
