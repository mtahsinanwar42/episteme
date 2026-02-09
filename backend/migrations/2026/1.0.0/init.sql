\set ON_ERROR_STOP on
SELECT 'CREATE DATABASE episteme'
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_database
  WHERE datname = 'episteme'
)\gexec
\connect episteme
