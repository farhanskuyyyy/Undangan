FROM node:22-slim

# build tools buat better-sqlite3 (node-gyp butuh python3 + make + g++)
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# dependency di /deps — TIDAK di /app biar gak ketimpa mount folder host
WORKDIR /deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

ENV NODE_ENV=production \
    PORT=3456 \
    NODE_PATH=/deps/node_modules

# /app diisi dari host lewat compose (index.js, undangan.db, uploads/)
WORKDIR /app
RUN mkdir -p /app

EXPOSE 3456

HEALTHCHECK --interval=30s --timeout=6s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "/app/index.js"]
