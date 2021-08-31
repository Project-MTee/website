#!/bin/sh

set -e

# Setting default configuration values to unexistant ENV variables
echo PUBLIC_CLIENT_ID: $PPUBLIC_CLIENT_ID

# Replace configuration values from ENV variables
envsubst < /usr/share/nginx/html/assets/config.local.json > /usr/share/nginx/html/assets/config.json.temp
mv -f /usr/share/nginx/html/assets/config.local.json.temp /usr/share/nginx/html/assets/config.json

exec "$@"
