#!/usr/bin/env bash
set -euo pipefail

# Creates a temporary sqlite file, runs migrations against it, runs tests, then deletes the file.
TMP_DB="test-$(date +%s%N).db"
export DATABASE_URL="file:./$TMP_DB"

echo "Using temporary test DB: $TMP_DB"

# Apply migrations to the temp DB
npx prisma migrate deploy

# Run vitest
NODE_ENV=test npx vitest --run

# Cleanup
rm -f "$TMP_DB"
echo "Removed temporary test DB: $TMP_DB"
