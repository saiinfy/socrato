# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
# If you have environment variables, you can pass them as build args
# ARG VITE_GEMINI_API_KEY
# ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/dist /app/dist
# Copy source code for server
COPY server.ts package*.json ./

# Install dependencies
RUN npm install

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
