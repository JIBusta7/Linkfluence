-- INFLU — extensiones del perfil del influencer
-- Agrega: handles de redes, métricas declaradas, costo de contratación.
--
-- Correr en Supabase SQL Editor después de 001/002/003.

alter table public.profiles
  add column if not exists instagram_handle text,
  add column if not exists tiktok_handle   text,
  add column if not exists youtube_handle  text,
  add column if not exists twitter_handle  text,
  add column if not exists followers_total integer
    check (followers_total is null or followers_total >= 0),
  add column if not exists reach_estimate  integer
    check (reach_estimate  is null or reach_estimate  >= 0),
  add column if not exists hire_cost_min   numeric
    check (hire_cost_min   is null or hire_cost_min   >= 0),
  add column if not exists hire_cost_max   numeric
    check (hire_cost_max   is null or hire_cost_max   >= 0),
  add column if not exists location        text;

-- Storage bucket para avatares (idempotente)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies del bucket de avatars
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
