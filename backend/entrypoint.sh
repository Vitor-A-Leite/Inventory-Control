#!/bin/sh
set -e

echo "Waiting for PostgreSQL (${DB_HOST}:${DB_PORT})..."
while ! nc -z "${DB_HOST}" "${DB_PORT}"; do
  sleep 1
done

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting Django dev server..."
exec python manage.py runserver 0.0.0.0:8000
