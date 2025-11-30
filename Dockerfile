# Chatbot_Frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# copy package files first for caching
COPY package*.json ./

RUN npm ci

# copy rest of the frontend code
COPY . .

# expose the internal port we'll use
EXPOSE 8060

# run vite dev server binding to all interfaces on port 8060
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 8060"]
