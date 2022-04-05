#!/bin/bash
# usage example 
# ./scripts/run_query_on_postgres.sh "SELECT * from players where column = 'test';"

. ./envs/directus.env

# escape ' inside query with '\''
query="$(echo "$1" | sed s/\'/"\'\\\'\'"/g)"
sshpass -p "$HOST_PWD" ssh "$HOST_USER"@"$HOST" \
    "docker exec $DB_CONTAINER_NAME psql -U $DB_USER -c '\x' -c '$query'"