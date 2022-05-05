#!/bin/bash

./scripts/stop_bot_in_docker.sh
docker image rm idrofobia_bot_bot

docker-compose -f ./docker/docker-compose.base.yml \
    -f ./docker/docker-compose.local.yml --project-directory . up --build -d

docker exec idrofobia_db psql -U postgres -c '\x' -c "
    TRUNCATE idrofobia_players;
    TRUNCATE players;

    INSERT INTO players (name, surname, address)
    VALUES ('marco', 'luzzara', 'via marco');
    
    INSERT INTO idrofobia_players (id, telegram_id, last_kill, profile_picture_url, kill_code)
    VALUES (1, 'ma_luz', CURRENT_TIMESTAMP,
    'https://image.shutterstock.com/image-photo/palm-beach-600w-64215760.jpg', '0123456789');"