#!/usr/bin/env bash
# CI database initialisation: users table + wiki schema + test user
set -euo pipefail

echo "==> Creating users table (wiki FKs depend on it)..."
node -e "
  const { createClient } = require('@libsql/client');
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  (async () => {
    await client.execute(\`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT,
        is_admin INTEGER NOT NULL DEFAULT 0,
        is_approved INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    \`);
    console.log('  users table ready');
  })();
"

echo "==> Running wiki database setup..."
npx tsx lib/db/setup.ts

# Create test user if credentials are provided
if [ -n "${E2E_USER_EMAIL:-}" ] && [ -n "${E2E_USER_PASSWORD:-}" ]; then
  echo "==> Creating test user ($E2E_USER_EMAIL)..."
  node -e "
    const bcrypt = require('bcryptjs');
    const { createClient } = require('@libsql/client');
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    (async () => {
      const hash = await bcrypt.hash(process.env.E2E_USER_PASSWORD, 10);
      const id = 'ci-test-user-' + Date.now();
      const now = new Date().toISOString();
      await client.execute({
        sql: 'INSERT OR IGNORE INTO users (id, email, password_hash, name, is_admin, is_approved, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 1, ?, ?)',
        args: [id, process.env.E2E_USER_EMAIL, hash, 'CI Test User', now, now],
      });
      console.log('  Test user created (or already exists).');
    })();
  "
else
  echo "==> Skipping test user (E2E_USER_EMAIL / E2E_USER_PASSWORD not set)"
fi

echo "==> Database initialisation complete!"
