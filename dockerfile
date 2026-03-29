# 1. Etapa de dependencias
FROM node:20-alpine AS deps
# libc6-compat es necesaria para que algunas librerías de Node funcionen en Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos solo los archivos de configuración de paquetes
COPY package.json yarn.lock ./

# Instalamos dependencias usando yarn --frozen-lockfile para mayor seguridad
RUN yarn install --frozen-lockfile

# 2. Etapa de construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar telemetría y generar el build
ENV NEXT_TELEMETRY_DISABLED=1
#ENV NEXT_PUBLIC_API_URL=http://45.32.231.191:5002/
RUN yarn build

# 3. Etapa de producción (Runner)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario de sistema para no correr como root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar assets estáticos
COPY --from=builder /app/public ./public

# Setear permisos para el cache de Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiamos el output 'standalone' (requiere output: 'standalone' en next.config.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Ejecutamos con node directamente (más eficiente que yarn start en Docker)
CMD ["node", "server.js"]