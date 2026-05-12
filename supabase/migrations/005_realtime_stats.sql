-- Linkfluence — convertir materialized views a views regulares.
--
-- Motivación: en demo y en producción de bajo volumen los stats tienen que
-- reflejar cada click al instante. Las mviews requieren refresh manual
-- (refresh_stats()) y eso introduce un delay confuso para el usuario.
-- Con views regulares cada SELECT recalcula sobre las tablas base, lo cual
-- es perfectamente performante con miles de filas y mucho más simple.

-- Idempotente: detectamos si link_stats / influencer_category_stats existen
-- como materialized view (primera corrida) o como view regular (re-corrida).
do $$
begin
  if exists (
    select 1 from pg_matviews
    where schemaname = 'public' and matviewname = 'link_stats'
  ) then
    drop materialized view public.link_stats cascade;
  else
    drop view if exists public.link_stats cascade;
  end if;

  if exists (
    select 1 from pg_matviews
    where schemaname = 'public' and matviewname = 'influencer_category_stats'
  ) then
    drop materialized view public.influencer_category_stats cascade;
  else
    drop view if exists public.influencer_category_stats cascade;
  end if;
end $$;

create or replace view public.link_stats as
select
  l.id as link_id,
  l.influencer_id,
  l.product_id,
  coalesce(count(distinct ce.id), 0)::int as clicks,
  coalesce(count(distinct cv.id), 0)::int as conversions,
  coalesce(sum(cv.amount), 0)::numeric as revenue,
  case
    when count(distinct ce.id) = 0 then 0
    else count(distinct cv.id)::float / count(distinct ce.id)
  end as cr
from public.links l
left join public.click_events ce on ce.link_id = l.id
left join public.conversions cv on cv.link_id = l.id
group by l.id, l.influencer_id, l.product_id;

create or replace view public.influencer_category_stats as
select
  l.influencer_id,
  p.category,
  p.style,
  p.material,
  p.price_range,
  coalesce(count(distinct ce.id), 0)::int as clicks,
  coalesce(count(distinct cv.id), 0)::int as conversions,
  coalesce(sum(cv.amount), 0)::numeric as revenue,
  case
    when count(distinct ce.id) = 0 then 0
    else count(distinct cv.id)::float / count(distinct ce.id)
  end as cr
from public.links l
join public.products p on p.id = l.product_id
left join public.click_events ce on ce.link_id = l.id
left join public.conversions cv on cv.link_id = l.id
group by l.influencer_id, p.category, p.style, p.material, p.price_range;

-- Recrear influencer_totals: el CASCADE del DROP de link_stats también la
-- tiró (porque dependía de link_stats), así que hay que volver a crearla.
create or replace view public.influencer_totals as
select
  l.influencer_id,
  count(distinct l.id)::int as total_links,
  coalesce(sum(ls.clicks), 0)::int as total_clicks,
  coalesce(sum(ls.conversions), 0)::int as total_conversions,
  coalesce(sum(ls.revenue), 0)::numeric as total_revenue,
  case
    when coalesce(sum(ls.clicks), 0) = 0 then 0
    else sum(ls.conversions)::float / sum(ls.clicks)
  end as cr_global
from public.links l
left join public.link_stats ls on ls.link_id = l.id
group by l.influencer_id;

-- refresh_stats() ya no hace nada, pero mantenemos la función para no
-- romper server actions que la llamaban.
create or replace function public.refresh_stats()
returns void language plpgsql security definer set search_path = public as $$
begin
  return;
end;
$$;

grant execute on function public.refresh_stats() to authenticated, anon;
