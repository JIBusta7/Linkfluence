/**
 * Helper interactivo para obtener un access_token de Mercado Libre.
 *
 * Mercado Libre cerró la API pública en 2024-2025: ahora cualquier llamada
 * a /sites/MLU/search devuelve 403 sin OAuth2. Para conseguir un token hay
 * que registrar una app y completar el flujo authorization_code.
 *
 * Uso:
 *   1. Registrar app en https://developers.mercadolibre.com.uy/devcenter
 *      con Redirect URI = el dominio donde corre tu app (ej.
 *      https://linkfluence-sage.vercel.app/).
 *   2. Copiar Client ID y Client Secret a .env.local:
 *        MELI_CLIENT_ID=...
 *        MELI_CLIENT_SECRET=...
 *        MELI_REDIRECT_URI=https://linkfluence-sage.vercel.app/
 *   3. Correr: npm run meli:auth
 *   4. Seguir las instrucciones que imprime el script.
 *   5. Pegar el access_token resultante en .env.local Y en Vercel envs.
 *   6. Correr: npm run sync:catalog
 *
 * El access_token dura 6 horas. El catálogo queda sincronizado en Supabase,
 * así que el token solo es necesario cuando querés actualizar productos.
 */
import { createInterface } from 'node:readline/promises';

async function main() {
  const CLIENT_ID = process.env.MELI_CLIENT_ID;
  const CLIENT_SECRET = process.env.MELI_CLIENT_SECRET;
  const REDIRECT_URI = process.env.MELI_REDIRECT_URI;

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Faltan variables en .env.local:');
    console.error('  MELI_CLIENT_ID');
    console.error('  MELI_CLIENT_SECRET');
    console.error('  MELI_REDIRECT_URI (ej: https://linkfluence-sage.vercel.app/)');
    console.error('\nConseguilos en https://developers.mercadolibre.com.uy/devcenter');
    process.exit(1);
  }

  const authUrl = `https://auth.mercadolibre.com.uy/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI,
  )}`;

  console.log('\n============================================================');
  console.log(' Mercado Libre OAuth — flujo interactivo');
  console.log('============================================================\n');

  console.log('PASO 1: Abrí esta URL en el browser (con tu cuenta de ML logueada):\n');
  console.log(`  ${authUrl}\n`);
  console.log('PASO 2: Autorizá la app cuando ML te lo pida.\n');
  console.log(`PASO 3: ML te redirigirá a ${REDIRECT_URI}?code=XXXXXX`);
  console.log('         Copiá SOLO el valor de "code" (todo lo que sigue a code=)\n');

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const code = (await rl.question('Pegá el code acá: ')).trim();
  rl.close();

  if (!code) {
    console.error('\nNo diste un code. Saliendo.');
    process.exit(1);
  }

  console.log('\n→ Intercambiando code por access_token…');
  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    message?: string;
  };

  if (!res.ok || !json.access_token) {
    console.error(`\n✗ ML devolvió HTTP ${res.status}`);
    console.error(JSON.stringify(json, null, 2));
    console.error(
      '\nVerificá que el code sea reciente (caducan en minutos) y que el',
      'redirect_uri coincida EXACTAMENTE con el de la app en developers ML.',
    );
    process.exit(1);
  }

  console.log('\n✓ ¡Token obtenido!\n');
  console.log('Pegá esto en tu .env.local (y también en Environment Variables de Vercel):\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`MELI_ACCESS_TOKEN=${json.access_token}`);
  if (json.refresh_token) {
    console.log(`MELI_REFRESH_TOKEN=${json.refresh_token}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Token válido por ${json.expires_in ?? 21600} segundos (~6 horas).`);
  console.log('\nDespués corré:\n  npm run sync:catalog\n');
}

main().catch((err) => {
  console.error('✗ Error:', err);
  process.exit(1);
});
