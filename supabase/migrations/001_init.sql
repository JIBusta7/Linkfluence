-- Linkfluence — schema inicial
-- Ejecutar en Supabase SQL Editor en este orden: 001, 002, 003.

create extension if not exists pgcrypto;
create extension if not exists vector;

-- =========================================================================
-- profiles (1:1 con auth.users)
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('influencer', 'company', 'admin')),
  display_name text not null,
  bio text,
  categories text[] not null default '{}',    -- intereses del influencer
  industry text,                               -- para empresas
  avatar_url text,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- =========================================================================
-- products (catálogo global con estado)
-- =========================================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  external_url text not null,
  image_url text,
  category text not null,
  style text,
  material text,
  price_range text not null check (price_range in ('low', 'mid', 'high', 'luxury')),
  price_numeric numeric,
  tags text[] not null default '{}',
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected')),
  submitted_by uuid references public.profiles(id) on delete set null,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index products_status_idx on public.products (status);
create index products_category_verified_idx on public.products (category)
  where status = 'verified';
create index products_submitted_by_idx on public.products (submitted_by);

-- =========================================================================
-- product embeddings (pgvector)
-- =========================================================================
create table public.product_embeddings (
  product_id uuid primary key references public.products(id) on delete cascade,
  embedding vector(1536) not null,
  updated_at timestamptz not null default now()
);

create index product_embeddings_ivfflat_idx
  on public.product_embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- =========================================================================
-- links (influencer → producto verificado)
-- =========================================================================
create table public.links (
  id uuid primary key default gen_random_uuid(),
  short_code text unique not null,
  influencer_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  coupon_code text,
  created_at timestamptz not null default now(),
  unique (influencer_id, product_id)
);

create index links_influencer_idx on public.links (influencer_id);
create index links_product_idx on public.links (product_id);

-- trigger: solo permitir links sobre productos verified
create or replace function public.enforce_verified_product()
returns trigger language plpgsql as $$
declare
  prod_status text;
begin
  select status into prod_status from public.products where id = new.product_id;
  if prod_status is distinct from 'verified' then
    raise exception 'No se pueden crear links sobre productos no verificados (estado=%)', prod_status;
  end if;
  return new;
end;
$$;

create trigger links_verified_product_check
  before insert or update on public.links
  for each row execute function public.enforce_verified_product();

-- =========================================================================
-- click_events
-- =========================================================================
create table public.click_events (
  id bigserial primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  ip_hash text,
  user_agent text,
  referer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  created_at timestamptz not null default now()
);

create index click_events_link_idx on public.click_events (link_id, created_at desc);

-- =========================================================================
-- conversions
-- =========================================================================
create table public.conversions (
  id bigserial primary key,
  link_id uuid not null references public.links(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  source text not null check (source in ('coupon', 'manual', 'simulated')),
  occurred_at timestamptz not null default now(),
  notes text
);

create index conversions_link_idx on public.conversions (link_id);
create index conversions_occurred_idx on public.conversions (occurred_at desc);

-- =========================================================================
-- company_searches (auditoría + historial)
-- =========================================================================
create table public.company_searches (
  id bigserial primary key,
  company_id uuid references public.profiles(id) on delete set null,
  query_product_id uuid references public.products(id) on delete set null,
  query_payload jsonb not null,
  result_snapshot jsonb,
  created_at timestamptz not null default now()
);

create index company_searches_company_idx on public.company_searches (company_id, created_at desc);

-- =========================================================================
-- trigger: crear profile al signup (default role 'influencer')
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'influencer'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
