#!/usr/bin/env sh
# Simple wait-for script
set -e
host="$1"
port="$2"
shift 2
cmd="$@"

echo "Waiting for $host:$port..."
while ! nc -z "$host" "$port"; do
  echo "Waiting for $host:$port..."
  sleep 2
done
echo "$host:$port is available — running command"
exec $cmd
