#!/bin/bash

./scripts/stop_bot_in_docker.sh
docker image rm idrofobia_bot_bot

docker-compose -f ./docker/docker-compose.base.yml \
    -f ./docker/docker-compose.local.yml --project-directory . up --build -d

sleep 5

docker exec idrofobia_db psql -U postgres -c '\x' -c "
    DROP TABLE idrofobia_players;
    DROP TABLE players;

    $(cat ./scripts/db/create_schema.sql)

    WITH player_rows AS (
        INSERT INTO players (name, surname, address)
        VALUES ('marco', 'luzzara', 'via marco')
        RETURNING id AS player_id
    )
    INSERT INTO idrofobia_players (id, telegram_id, last_kill, profile_picture_url, kill_code)
    SELECT player_id, 'ma_luz', CURRENT_TIMESTAMP,
        'https://image.shutterstock.com/image-photo/palm-beach-600w-64215760.jpg', '0123456789'
    FROM player_rows;"
