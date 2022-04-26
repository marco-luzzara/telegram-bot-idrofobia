#!/bin/bash

docker-compose -f ./docker/docker-compose.yml --project-directory . down
docker image rm idrofobia_bot_bot

docker-compose -f ./docker/docker-compose.yml --project-directory . up --build -d