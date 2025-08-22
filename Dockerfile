# Building Stagee

ARG NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

RUN rm -rf /usr/share/nginx/html/*

FROM nginx:alpine

# Mounting configuration files

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]