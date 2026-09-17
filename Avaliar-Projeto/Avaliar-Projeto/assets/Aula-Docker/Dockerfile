# Use Node 24.13.1 as requested
FROM node:24.13.1-alpine

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "dev"]
