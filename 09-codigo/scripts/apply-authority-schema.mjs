import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const root = path.resolve(process.cwd(), '..');
const envText = await fs.readFile(path.join(process.cwd(), '.env.local'), 'utf8');
const env = {};
for (const raw of envText.split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
  if (!match) continue;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
  env[match[1]] = value;
}
if (!env.DATABASE_URL) throw new Error('DATABASE_URL missing in .env.local');

const client = new pg.Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 15000 });
const files = [
  path.join(root, '04-database', '001-custom-authorityengine-operational.sql'),
  path.join(root, '04-database', '002-registry-gateway-audit.sql'),
];
const tables = [
  'projects','opportunities','research','influencer_seeds','profiles','farmer_profiles','briefs','content_items','post_machine_outputs','assets','approvals','receipts','metrics','feedback','events','authority_outbox_events','outbox_receipts',
  'partner_programs','sources','llm_runs','audit_events'
];
try {
  await client.connect();
  await client.query('BEGIN');
  for (const file of files) await client.query(await fs.readFile(file, 'utf8'));
  const result = await client.query(`select table_name, to_regclass(format('%I.%I', 'custom_authorityengine', table_name)) is not null as exists from unnest($1::text[]) as table_name order by table_name`, [tables]);
  const missing = result.rows.filter((row) => !row.exists).map((row) => row.table_name);
  const policies = await client.query("select count(*)::int as count from pg_policies where schemaname = 'custom_authorityengine'");
  if (missing.length) throw new Error(`readback_missing_tables:${missing.join(',')}`);
  await client.query('COMMIT');
  console.log(JSON.stringify({ status: 'applied', schema: 'custom_authorityengine', tables: result.rows.length, missing: [], policies: policies.rows[0].count, ddl_files: files.map((file) => path.basename(file)) }));
} catch (error) {
  try { await client.query('ROLLBACK'); } catch {}
  console.error(JSON.stringify({ status: 'rolled_back', error: error instanceof Error ? error.message : String(error) }));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
