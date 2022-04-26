#!/bin/bash

. ./scripts/envs/local.env

docker-compose -f ./docker/docker-compose.base.yml \
    -f ./docker/docker-compose.local.yml --project-directory . up \
    -d --force-recreate database

until docker exec $DB_CONTAINER_NAME psql -U "postgres" -c '\q'; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 2
done
  
>&2 echo "Postgres is up - executing command"

NODE_ENV=integration_test node --no-warnings --experimental-vm-modules \
    node_modules/.bin/jest --runInBand tests/services/

docker-compose -f ./docker/docker-compose.base.yml \
    -f ./docker/docker-compose.local.yml --project-directory . rm \
    -f database