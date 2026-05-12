# Linkfluence

Plataforma de inteligencia comercial para influencer marketing. MVP universitario construido con Next.js 15 + TypeScript + Supabase + Vercel, con apoyo intensivo de IA (Claude Haiku 4.5 para explicaciones, OpenAI embeddings para similitud semántica).

---

## Qué hace

- **Influencers** navegan un **catálogo global de productos verificados**, generan su **link trackeable único** y ven un dashboard con CR, clicks, conversiones y categorías top.
- Si no encuentran un producto, lo **proponen al catálogo**; queda `pending` hasta que un admin lo aprueba.
- **Empresas** consultan un producto (pegan URL o completan datos) y reciben un **ranking top-N de influencers** con **fit score** y **explicación natural** generada por IA, razonando por similitud cuando no hay historial exacto.
- **Admins** ven la cola de verificación, aprueban/rechazan productos, simulan tráfico y supervisan la data.

### Fit score

```
fit_score = 0.35 · exact_perf
          + 0.30 · similar_perf
          + 0.15 · category_match
          + 0.08 · style_match
          + 0.05 · price_match
          + 0.07 · volume_confidence
```

Implementado en [lib/scoring.ts](lib/scoring.ts). `similar_perf` es la clave del caso golden: cuando el producto consultado no tiene historial exacto, se calcula performance ponderada por similitud sobre los productos candidatos.

### Similitud entre productos

```
sim(A, B) = 0.6 · cosine(emb_A, emb_B)
         + 0.25 · jaccard(tags_A, tags_B)
         + 0.10 · (category_A == category_B ? 1 : 0)
         + 0.05 · price_range_proximity(A, B)
```

Embeddings con `text-embedding-3-small` (1536d) almacenados en Postgres con [pgvector](https://github.com/pgvector/pgvector). Si no hay OpenAI key, el sistema cae en un embedding determinístico por hash (funciona para la demo, calidad menor).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + Server Actions |
| Lenguaje | TypeScript estricto |
| UI | Tailwind CSS + componentes propios al estilo shadcn/ui + Recharts |
| DB | Supabase Postgres + pgvector |
| Auth | Supabase Auth (email/password) + middleware |
| IA | Vercel AI SDK + Anthropic Claude Haiku 4.5 + OpenAI embeddings |
| Deploy | Vercel + Supabase cloud |

---

## Setup local

### 1. Crear proyecto en Supabase

1. Crear proyecto en [supabase.com](https://supabase.com).
2. En SQL editor, ejecutar en orden (copiá y pegá cada archivo, dale Run):
   - [supabase/migrations/001_init.sql](supabase/migrations/001_init.sql)
   - [supabase/migrations/002_rls.sql](supabase/migrations/002_rls.sql)
   - [supabase/migrations/003_mviews.sql](supabase/migrations/003_mviews.sql)
   - [supabase/migrations/004_profile_extensions.sql](supabase/migrations/004_profile_extensions.sql)
   - [supabase/migrations/005_realtime_stats.sql](supabase/migrations/005_realtime_stats.sql) ← convierte mviews en views regulares para que los clicks se reflejen al instante en stats.
3. **Authentication → Providers → Email**: activar. **Authentication → Settings**: desactivar "Confirm email" para que los usuarios entren sin tener que confirmar (cómodo para demo).
4. **Authentication → URL Configuration**: poner `Site URL` = tu dominio público (`https://tuapp.vercel.app` o `http://localhost:3000` en dev).

### 2. Variables de entorno

Copiar `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Completar:

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto (ej. `https://xxx.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — desde Project Settings → API.
- `SUPABASE_SERVICE_ROLE_KEY` — también desde API. **Nunca exponer en cliente**.
- `ANTHROPIC_API_KEY` — opcional. Sin esta key, las explicaciones usan fallback templated.
- `OPENAI_API_KEY` — opcional. Sin esta key, los embeddings son determinísticos por hash (la demo sigue funcionando).

### 3. Instalar, seedear y sincronizar catálogo real

```bash
npm install
npm run seed             # usuarios demo, 15 influencers, conversiones simuladas
npm run sync:catalog     # ~120 productos reales con imágenes HD (DummyJSON / Mercado Libre)
npm run dev
```

El seed crea 1 admin, 3 empresas, 15 influencers, 40 productos demo, ~2000 clicks y ~100 conversiones.

`sync:catalog` agrega 120 productos extra con imágenes y datos reales:
- Por defecto usa **[DummyJSON](https://dummyjson.com)** (no requiere auth, productos reales con imágenes HD).
- Si configurás `MELI_ACCESS_TOKEN` en `.env.local`, usa **Mercado Libre Uruguay** en lugar de DummyJSON. Para conseguir el token registrá una app en https://developers.mercadolibre.com.uy y completá el flujo OAuth2.
- Los productos importados llevan el tag `external`: re-correr el script borra los anteriores y los reinserta sin tocar tus productos manuales.
- El `external_url` (a donde te lleva al hacer click en el link trackeable) apunta a búsquedas reales en `listado.mercadolibre.com.uy`, así un click final lleva al usuario a productos reales para comprar.

### 4. Usuarios demo

| Rol | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `demo1234` |
| Empresa | `acme@demo.com` | `demo1234` |
| Empresa | `technova@demo.com` | `demo1234` |
| Empresa | `glowlab@demo.com` | `demo1234` |
| Influencer estrella | `amy@demo.com` | `demo1234` |
| ... | (ver [scripts/seed.ts](scripts/seed.ts)) | `demo1234` |

---

## Caso golden

El seed **no incluye "botas de cuero"** adrede. El flujo para demostrar el diferencial:

1. Login como `acme@demo.com`.
2. Ir a `/company/search`.
3. Completar el formulario con: **Nombre** "Botas de cuero premium", **Categoría** `moda`, **Estilo** `urbano`, **Material** `cuero`, **Precio** `high`, tags `cuero, botas, urbano, premium`.
4. Submit. El ranking debería mostrar en top-3 a **Amy Urban**, **Martina Premium** y/o **Juli Street**, con explicación natural citando su historial en productos de cuero adyacentes (campera, cinturón, billetera, mochila de cuero).

Si las explicaciones dicen "IA" en el chip, es Claude Haiku. Si no, fallback determinístico.

---

## Deploy (gratis, paso a paso)

El stack es 100% compatible con tiers gratuitos: **Supabase Free** + **Vercel Hobby**. Para que un usuario externo (ej. tu profesor) pueda crear cuenta y usar la app, hay que dejar Supabase listo y subir el front a Vercel.

### 1. Supabase (DB + Auth)

1. Crear proyecto en [supabase.com](https://supabase.com) (Free tier).
2. SQL editor → correr en orden los archivos de `supabase/migrations/` (001 → 005). Cada uno: copiar todo el contenido, pegar, Run.
3. **Authentication → Providers**: dejar "Email" activado.
4. **Authentication → Settings → User Signups**: dejar "Allow new users to sign up" activado. **Desactivar "Confirm email"** para que los usuarios nuevos puedan entrar al toque sin verificar email (ideal para una demo).
5. **Authentication → URL Configuration**:
   - `Site URL` → tu dominio futuro de Vercel (lo configurás después). Por ahora podés poner `http://localhost:3000`.
   - `Redirect URLs` → agregá `https://*.vercel.app/**` (cobertura amplia) y tu dominio final cuando lo tengas.
6. **Project Settings → API**: copiar `Project URL`, `anon public key`, `service_role key`. Los necesitás para `.env.local` y para Vercel.

### 2. Sembrar data demo en tu Supabase

Desde tu máquina, con `.env.local` apuntando al proyecto:

```bash
npm install
npm run seed              # usuarios demo + productos seed + tráfico simulado
npm run sync:catalog      # 120 productos reales con imágenes
```

### 3. Subir el código a GitHub

```bash
git init
git add .
git commit -m "first commit"
gh repo create linkfluence --public --source=. --push
# o desde el browser: crear repo en github.com y git push manual
```

### 4. Vercel (front + APIs)

1. Entrar a [vercel.com](https://vercel.com), New Project, importar el repo de GitHub.
2. Framework: Next.js (auto-detectado).
3. **Environment Variables** — pegar lo mismo que en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (marcala como Secret)
   - `ANTHROPIC_API_KEY` (opcional)
   - `OPENAI_API_KEY` (opcional)
   - `NEXT_PUBLIC_APP_URL` = `https://<tu-deployment>.vercel.app` (después del primer deploy)
4. Deploy. Vercel te asigna un dominio tipo `linkfluence-xyz.vercel.app`.
5. Volver a Supabase → Authentication → URL Configuration y poner tu dominio definitivo de Vercel como `Site URL`.
6. (Opcional) En Vercel, settings → Environment Variables → editá `NEXT_PUBLIC_APP_URL` con el dominio definitivo y redeployá. Esto es solo para que los links generados muestren el dominio correcto en SSR (en el browser ya se autodetecta).

### 5. Verificar end-to-end

1. Entrar a tu dominio de Vercel.
2. Crear cuenta nueva con cualquier email (ej. el de tu profe).
3. Onboarding → catálogo → click en un producto → "Generar mi link".
4. Copiar el link `https://<tu-dominio>.vercel.app/r/<code>`.
5. Pegarlo en una ventana incógnito (o pasárselo a otra persona). El click debe registrar y redirigir a la búsqueda real en Mercado Libre.
6. Volver al dashboard del influencer → los clicks aparecen en KPIs y gráficos en tiempo real (gracias a la migración 005 que convirtió las mviews en views regulares).

### Notas de free tier

- **Supabase Free**: 500 MB DB, 1 GB transferencia/mes, hasta 50.000 monthly active users. Pausa el proyecto si está 7 días inactivo — entrá al dashboard cada semana para mantenerlo vivo durante la demo.
- **Vercel Hobby**: 100 GB bandwidth/mes, deploys ilimitados, dominios `.vercel.app`. Más que suficiente.

---

## Estructura

```
app/
  (marketing)          landing + /demo guiada
  login, signup, onboarding
  r/[code]             tracker de clicks (redirect 302)
  influencer/          dashboard, catalog, my-submissions, links
  company/             dashboard, search, recommendations/[id]
  admin/               panel, verification, products, users, events, simulate
  api/explain          LLM explanations para recomendaciones
components/
  ui/                  button, input, card, badge, select, table, textarea, label
  charts/              recharts wrappers
  app-shell.tsx        sidebar con nav por rol
lib/
  supabase/            client, server, middleware
  ai/                  classify, embed, explain (con fallbacks)
  scoring.ts           fit_score + similarity
  recommend.ts         pipeline de recomendación
  taxonomy.ts          categorías/estilos/materiales cerrados
  links.ts             generación de short_code
  types.ts             tipos compartidos
supabase/migrations/   schema + RLS + mviews
scripts/seed.ts        data seed reproducible
```

---

## Flujo de verificación de productos

1. Influencer entra a `/influencer/catalog` y no encuentra lo que busca.
2. Click en "¿No lo encontrás? Agregalo" → `/influencer/catalog/new`.
3. Pega URL, presiona "Pre-rellenar con IA" → Claude clasifica (categoría, estilo, material, precio, tags, descripción).
4. Corrige lo que haga falta, submit → producto queda `pending`.
5. Admin abre `/admin/verification`, ve el producto propuesto, decide:
   - **Aprobar**: entra al catálogo global como `verified` y se genera el embedding automáticamente.
   - **Rechazar**: se guarda `rejection_reason`; el influencer lo ve en `/influencer/my-submissions`.
6. Ya `verified`, cualquier influencer puede generar su propio link personal sobre ese producto.

---

## Decisiones técnicas destacables

- **Tracking en Node runtime** (no edge): simplifica el uso del service role key y permite insertar via `supabase-js` sin overhead. Para latencia mínima real, convertir a RPC edge-friendly.
- **Embeddings on-approval**: se generan cuando el admin aprueba el producto, no al submit, para evitar gastar LLM en productos rechazados.
- **Fallbacks determinísticos**: toda llamada a IA tiene un fallback sin API keys — la demo corre aunque no haya keys configuradas.
- **Views regulares** para stats en tiempo real (`link_stats`, `influencer_category_stats`, `influencer_totals`). La migración 005 convirtió las mviews originales en views normales para que cada click se vea reflejado al instante en el dashboard del influencer, sin tener que llamar a `refresh_stats()`.
- **RLS estricto**: influencers ven solo sus productos `pending` + todo el catálogo `verified`. Escribir `status=verified` solo puede hacerlo un admin.
- **Caso golden diseñado**: el seed omite "botas de cuero" para forzar que la demo pruebe el caso por similitud.

---

## Fuera de alcance (explícito)

- Pagos reales, payouts, comisiones fiscales.
- Integraciones con Instagram / TikTok / YouTube.
- Marketplace público.
- Mobile app.
- Anti-fraude / detección de clicks bot.
- Notificaciones transaccionales (email/push).
- Multi-idioma (queda en español).
