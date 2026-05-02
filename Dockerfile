FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Default command
CMD ["npm", "run", "dev", "--", "--host"]