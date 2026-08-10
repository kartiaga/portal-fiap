#!/bin/sh
set -e

echo "Aplicando migrations..."
npm run migrate:up

echo "Iniciando API..."
exec npm start