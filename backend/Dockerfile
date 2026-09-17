FROM node:24.13.1-alpine

# Install dependencies for Prisma and native extensions
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy dependency files first for caching
COPY package*.json ./
RUN npm install

# Copy source and prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

# Start in development mode (as defined in docker-compose)
CMD ["npm", "run", "dev"]

