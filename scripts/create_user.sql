-- scripts/create_user.sql
-- SQL helper to create a user for the `users` table (PostgreSQL)
-- Read the project's users migration to confirm columns: see
-- [migrations/1781399377280_create-users-table.js](migrations/1781399377280_create-users-table.js#L1-L40)

-- ===== Option A: Use pgcrypto to hash password inside Postgres =====
-- Requires the pgcrypto extension. This will generate a bcrypt-style hash
-- with cost 10 (same salt rounds used in the application).

-- Enable extension (run once as a superuser):
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example insert (replace email and plaintext_password):
-- INSERT INTO users (email, password, role)
-- VALUES (
--   'user@example.com',
--   crypt('plaintext_password', gen_salt('bf', 10)),
--   'STUDENT'
-- );


-- ===== Option B: Precompute bcrypt hash (recommended if you cannot
-- enable pgcrypto). Generate the hash externally and insert the value.

-- Example: generate hash with Node.js
-- node -e "const bcrypt=require('bcrypt'); bcrypt.hash('plaintext_password',10).then(h=>console.log(h))"

-- Then run the insert with the produced hash string (keep quotes):
-- INSERT INTO users (email, password, role)
-- VALUES (
--   'user@example.com',
--   '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
--   'STUDENT'
-- );


-- ===== Notes =====
-- - The `id`, `created_at` and `updated_at` columns have defaults so they
--   are omitted from the INSERT above.
-- - Valid roles are: STUDENT, TEACHER, ADMIN (type `user_role`).
-- - Do NOT hardcode production secrets into repository files.
--   To run the app, set `JWT_SECRET` in your environment (e.g., .env):
--   Example (local): export JWT_SECRET="JndhsHBH2IF&b18219hrbHIKBjk83h9naj@nf$sibdob<88y8bf"

-- ===== Quick verification queries =====
-- Check the table columns:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;

-- Check inserted user:
-- SELECT id, email, role, created_at FROM users WHERE email = 'user@example.com';
