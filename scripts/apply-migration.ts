/**
 * Aplica un archivo SQL de supabase/migrations contra el proyecto Supabase
 * configurado en .env.local. Intenta el endpoint /pg/query del pg-meta;
 * si Supabase ya no lo expone para tu plan, te imprime el SQL para que lo
 * pegues en el SQL editor del dashboard.
 *
 * Uso: npm run migrate -- 005
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

async function main() {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SRV_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPA_URL || !SRV_KEY) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
  }

  const prefix = process.argv[2];
  if (!prefix) {
    console.error('Pasá el prefijo del archivo. Ej: npm run migrate -- 005');
    process.exit(1);
  }

  const migrationsDir = resolve(process.cwd(), 'supabase/migrations');
  const files = readdirSync(migrationsDir);
  const target = files.find((f) => f.startsWith(prefix) && f.endsWith('.sql'));
  if (!target) {
    console.error(`No encontré ningún archivo en ${migrationsDir} que empiece con "${prefix}"`);
    process.exit(1);
  }

  const sql = readFileSync(resolve(migrationsDir, target), 'utf-8');
  console.log(`→ aplicando ${target} (${sql.length} chars)`);

  const res = await fetch(`${SUPA_URL}/pg/query`, {
    method: 'POST',
    headers: {
      apikey: SRV_KEY,
      Authorization: `Bearer ${SRV_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`✗ Supabase devolvió HTTP ${res.status}`);
    console.error(text.slice(0, 500));
    console.error('\nWorkaround: abrí el SQL editor del dashboard de Supabase y pegá:\n');
    console.error('---8<-------------------------------------------------------');
    console.error(sql);
    console.error('---8<-------------------------------------------------------\n');
    process.exit(1);
  }
  console.log(`✓ ${target} aplicada.`);
}

main();
