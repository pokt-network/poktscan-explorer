import { Pool, PoolClient } from 'pg';
import { to as copyTo } from 'pg-copy-streams';
import { Readable } from 'stream';

let pool: Pool | null = null;

/**
 * Get or create a PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DB_USER) {
      throw new Error('DB_USER environment variable is not set');
    }

    if (!process.env.DB_PASS) {
      throw new Error('DB_PASS environment variable is not set');
    }

    if (!process.env.DB_DATABASE) {
      throw new Error('DB_DATABASE environment variable is not set');
    }

    if (!process.env.DB_HOST) {
      throw new Error('DB_HOST environment variable is not set');
    }

    if (!process.env.DB_PORT) {
      throw new Error('DB_PORT environment variable is not set');
    }

    const databaseUri = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

    const minConnections = Number.isInteger(parseInt(process.env.DB_MIN_CONNECTIONS || '')) ? parseInt(process.env.DB_MIN_CONNECTIONS!) : 1;
    const maxConnections = Number.isInteger(parseInt(process.env.DB_MAX_CONNECTIONS || '')) ? parseInt(process.env.DB_MAX_CONNECTIONS!) : 10;

    pool = new Pool({
      connectionString: databaseUri,
      max: maxConnections,
      min: minConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Execute COPY TO STDOUT and return a readable stream
 * Uses pg-copy-streams for true streaming - data flows directly to the client
 * as it's generated, providing a better user experience
 */
export async function getCopyStream(copyQuery: string): Promise<{
  stream: Readable;
  client: PoolClient;
}> {
  const client = await getClient();

  try {
    const copyStream = client.query(copyTo(copyQuery));

    // Return both the stream and client so caller can manage lifecycle
    return {
      stream: copyStream,
      client,
    };
  } catch (error) {
    client.release();
    throw error;
  }
}
