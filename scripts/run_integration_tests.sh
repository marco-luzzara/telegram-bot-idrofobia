#!/bin/bash

. ./envs/local.env

docker-compose -f ./scripts/docker/docker-compose.yml up -d --force-recreate 

until docker exec $DB_CONTAINER_NAME psql -U "postgres" -c '\q'; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 2
done
  
>&2 echo "Postgres is up - executing command"

NODE_ENV=integration_test node --no-warnings --experimental-vm-modules \
    node_modules/.bin/jest --runInBand tests/services/

docker-compose -f ./scripts/docker/docker-compose.yml down