#!/bin/bash

docker-compose -f ./docker/docker-compose.base.yml \
    -f ./docker/docker-compose.local.yml --project-directory . down