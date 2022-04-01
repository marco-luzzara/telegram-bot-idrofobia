. ./envs/directus.env

# usage example ./scripts/run_query_on_postgres.sh 'SELECT * from "Player";'
sshpass -p "$HOST_PWD" ssh "$HOST_USER"@"$HOST" $RUN_PSQL_COMMAND "'$1'"