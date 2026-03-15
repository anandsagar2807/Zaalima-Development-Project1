# CreditSense - Backend Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
