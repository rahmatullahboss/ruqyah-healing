import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema.js';

export function createDb(databaseUrl) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  const client = neon(databaseUrl);
  return drizzle({ client, schema });
}
