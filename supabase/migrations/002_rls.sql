-- Linkfluence — Row Level Security
-- Principios:
--  - todo usuario autenticado solo ve lo suyo + productos verified
--  - admins ven todo
--  - writes sensibles (click_events, conversions, cambios de status) solo via service role

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_embeddings enable row level security;
alter table public.links enable row level security;
alter table public.click_events enable row level security;
alter table public.conversions enable row level security;
alter table public.company_searches enable row level security;

-- =========================================================================
-- helper: is_admin()
-- =========================================================================
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- =========================================================================
-- profiles
-- =========================================================================
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy profiles_select_public_minimal on public.profiles
  for select using (role = 'influencer');  -- empresas pueden ver influencers

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- =========================================================================
-- products
-- =========================================================================
create policy products_select_verified_or_own on public.products
  for select using (
    status = 'verified'
    or submitted_by = auth.uid()
    or public.is_admin()
  );

create policy products_insert_authenticated on public.products
  for insert with check (
    auth.uid() is not null
    and status = 'pending'
    and submitted_by = auth.uid()
    and verified_by is null
    and verified_at is null
  );

create policy products_update_admin on public.products
  for update using (public.is_admin()) with check (public.is_admin());

-- el propio submitter puede editar mientras esté pending
create policy products_update_own_while_pending on public.products
  for update using (
    submitted_by = auth.uid() and status = 'pending'
  ) with check (
    submitted_by = auth.uid() and status = 'pending'
  );

-- =========================================================================
-- product_embeddings (solo admin/service role escribe, lectura autenticada)
-- =========================================================================
create policy product_embeddings_select_authenticated on public.product_embeddings
  for select using (auth.uid() is not null);

-- sin insert/update/delete en RLS → solo service role

-- =========================================================================
-- links
-- =========================================================================
create policy links_select_own_or_admin on public.links
  for select using (influencer_id = auth.uid() or public.is_admin());

-- empresas pueden ver la metadata pública para recomendaciones (no filas masivas)
-- para simplificar el MVP: dejamos que el endpoint /api/recommend corra con service role

create policy links_insert_own on public.links
  for insert with check (influencer_id = auth.uid());

create policy links_delete_own on public.links
  for delete using (influencer_id = auth.uid() or public.is_admin());

-- =========================================================================
-- click_events (solo admin/service role; sin RLS público)
-- =========================================================================
create policy click_events_select_admin on public.click_events
  for select using (public.is_admin());

-- el dueño del link puede ver sus propios clicks (para el dashboard)
create policy click_events_select_link_owner on public.click_events
  for select using (
    exists (select 1 from public.links l where l.id = click_events.link_id and l.influencer_id = auth.uid())
  );

-- =========================================================================
-- conversions
-- =========================================================================
create policy conversions_select_admin on public.conversions
  for select using (public.is_admin());

create policy conversions_select_link_owner on public.conversions
  for select using (
    exists (select 1 from public.links l where l.id = conversions.link_id and l.influencer_id = auth.uid())
  );

create policy conversions_insert_admin on public.conversions
  for insert with check (public.is_admin());

-- =========================================================================
-- company_searches
-- =========================================================================
create policy company_searches_select_own on public.company_searches
  for select using (company_id = auth.uid() or public.is_admin());

create policy company_searches_insert_own on public.company_searches
  for insert with check (company_id = auth.uid());
