FROM node:20-alpine AS base
RUN npm install --global corepack@latest
RUN corepack enable pnpm
WORKDIR /app

FROM base AS builder

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=builder /app/build .

# (Optional) Copy a custom nginx config if you have client-side routing (React Router)
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
