# stage 1 - prepare build image
FROM node:14 AS app-build
ARG JQ_VERSION=1.5
RUN wget --no-check-certificate https://github.com/stedolan/jq/releases/download/jq-${JQ_VERSION}/jq-linux64 -O /usr/bin/jq
RUN chmod +x /usr/bin/jq

# stage 2 - build app
FROM app-build as release
ARG PROJECT=mtee
ARG NPM_TOKEN

WORKDIR /app
# Install NPM dependencies
COPY package-lock.json .
COPY package.json .
COPY .npmrc .
RUN npm install

# Build app
COPY . .
RUN npm run build --prod

RUN jq '\
  .core.clientId="$PUBLIC_CLIENT_ID" |\
  dist/website-mtee/assets/config.local.json > dist/website-mtee/assets/config.local.json.tmp
RUN mv dist/website-mtee/assets/config.local.json.tmp dist/website-mtee/assets/config.local.json
  
RUN chmod +x entrypoint.sh
RUN cp entrypoint.sh dist/website-mtee/

# stage 3 - publish app
FROM nginx:alpine

COPY --from=release /app/dist/website-mtee /usr/share/nginx/html
RUN touch /usr/share/nginx/html/assets/tld-translate-web-component/tld-translate.js
RUN touch /usr/share/nginx/html/assets/tld-translate-web-component/styles.css

ENTRYPOINT [ "/usr/share/nginx/html/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]
