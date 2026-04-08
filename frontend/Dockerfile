FROM node:24.13.1-alpine

WORKDIR /app

# Copy dependency files first
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Next.js specific environment variables
ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev"]

