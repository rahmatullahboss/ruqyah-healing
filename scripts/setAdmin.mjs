import { neon } from '@neondatabase/serverless';

import fs from 'fs';
const devVars = fs.readFileSync('.dev.vars', 'utf-8');
const dbUrl = devVars.split('=')[1].trim();

const sql = neon(dbUrl);

async function main() {
  console.log('Connecting to neon database...');
  await sql`UPDATE users SET role = 'admin'`;
  console.log('All users have been set to admin role for testing.');
}

main().catch(console.error);
