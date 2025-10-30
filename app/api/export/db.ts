import { Pool, PoolClient } from 'pg';
import { to as copyTo } from 'pg-copy-streams';
import { Readable } from 'stream';

let pool: Pool | null = null;

/**
 * Get or create a PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const databaseUri = process.env.DATABASE_URI;

    if (!databaseUri) {
      throw new Error('DATABASE_URI environment variable is not set');
    }

    pool = new Pool({
      connectionString: databaseUri,
      max: 10,
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
