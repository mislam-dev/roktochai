FROM node:20-alpine AS base
RUN apk update && apk add --no-cache openssl 
RUN npm install --global corepack@latest
RUN npm install --global prisma@5.11.0
RUN corepack enable pnpm
WORKDIR /app 


FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build 

FROM base AS runner
COPY --from=builder /app/dist .
COPY ./package.json .
COPY ./pnpm-lock.yaml .
COPY ./prisma ./prisma

RUN pnpm install --prod --frozen-lockfile --ignore-script
RUN prisma generate 

EXPOSE 9000

CMD [ "node", "/app/app" ]


