import { Pool } from 'pg';

// Prefer discrete PG* vars when present — avoids having to percent-encode
// special characters (@, $, !, etc.) inside a single connection string URL.
const hasDiscretePgVars = Boolean(process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE);

export const pool = hasDiscretePgVars
  ? new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

export const testConnection = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
};
