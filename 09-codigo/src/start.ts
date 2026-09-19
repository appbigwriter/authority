import { Pool } from 'pg';
import { RelationalAuthorityStore } from './repository.js';
import { createAuthorityServer } from './server.js';

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`missing_required_runtime_config:${name}`);
  return value;
};

const port = Number(process.env.PORT ?? 3400);
const host = process.env.HOST ?? '0.0.0.0';
const databaseUrl = required('DATABASE_URL');
const projectId = required('AUTHORITY_PROJECT_ID');
const ownerId = required('AUTHORITY_OWNER_ID');
const pool = new Pool({ connectionString: databaseUrl, application_name: 'authority-engine' });
const store = new RelationalAuthorityStore(pool, { projectId, ownerId });

pool.query('select 1').then(() => {
  createAuthorityServer(store).listen(port, host, () => console.log(`authority-engine relational runtime listening on http://${host}:${port}`));
}).catch((error: unknown) => {
  console.error(`authority-engine database preflight failed: ${error instanceof Error ? error.message : 'unknown_error'}`);
  void pool.end();
  process.exitCode = 1;
});
