#!/bin/bash

./scripts/stop_bot_in_docker.sh
docker image rm idrofobia_bot_bot

docker-compose -f ./docker/docker-compose.base.yml \
    -f ./docker/docker-compose.local.yml --project-directory . up --build -d