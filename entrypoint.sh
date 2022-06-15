#!/bin/sh

set -e

# Setting default configuration values to unexistant ENV variables
echo PUBLIC_CLIENT_ID: $PUBLIC_CLIENT_ID
echo SANBOX: ${SANDBOX:='allow-forms allow-scripts allow-same-origin'}

# Replace configuration values from ENV variables
envsubst < /usr/share/nginx/html/assets/config.json > /usr/share/nginx/html/assets/config.json.temp
mv -f /usr/share/nginx/html/assets/config.json.temp /usr/share/nginx/html/assets/config.json

exec "$@"
