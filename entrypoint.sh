#!/bin/sh

set -e

# Setting default configuration values to unexistant ENV variables
echo PUBLIC_CLIENT_ID: $PUBLIC_CLIENT_ID
echo SANDBOX: ${SANDBOX:='allow-forms allow-scripts allow-same-origin'}
echo GRAMMAR_CHECK_URL: ${GRAMMAR_CHECK_URL:='api/grammar'}

# Replace configuration values from ENV variables
envsubst < /usr/share/nginx/html/assets/config.json > /usr/share/nginx/html/assets/config.json.temp
mv -f /usr/share/nginx/html/assets/config.json.temp /usr/share/nginx/html/assets/config.json

exec "$@"
