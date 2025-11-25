FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --prefer-offline --no-progress || true
COPY . .
RUN npm run build || true
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
