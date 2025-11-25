FROM node:20-alpine
WORKDIR /app

# Ensure installs always use the public registry and fail fast if dependencies are missing
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

COPY package.json package-lock.json* ./
RUN npm install --prefer-offline --no-progress
COPY . .
RUN npm run build
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
