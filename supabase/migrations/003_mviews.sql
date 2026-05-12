-- Linkfluence — vistas agregadas

-- stats por influencer y categoría
create materialized view if not exists public.influencer_category_stats as
select
  l.influencer_id,
  p.category,
  p.style,
  p.material,
  p.price_range,
  count(distinct ce.id)::int as clicks,
  count(distinct cv.id)::int as conversions,
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

create unique index if not exists influencer_category_stats_pk
  on public.influencer_category_stats (influencer_id, category, style, material, price_range);

-- stats por link (para dashboard del influencer)
create materialized view if not exists public.link_stats as
select
  l.id as link_id,
  l.influencer_id,
  l.product_id,
  count(distinct ce.id)::int as clicks,
  count(distinct cv.id)::int as conversions,
  coalesce(sum(cv.amount), 0)::numeric as revenue,
  case
    when count(distinct ce.id) = 0 then 0
    else count(distinct cv.id)::float / count(distinct ce.id)
  end as cr
from public.links l
left join public.click_events ce on ce.link_id = l.id
left join public.conversions cv on cv.link_id = l.id
group by l.id, l.influencer_id, l.product_id;

create unique index if not exists link_stats_pk on public.link_stats (link_id);

-- refresh helper (llamado desde server actions cuando cambia data)
create or replace function public.refresh_stats()
returns void language plpgsql security definer set search_path = public as $$
begin
  refresh materialized view public.link_stats;
  refresh materialized view public.influencer_category_stats;
end;
$$;

grant execute on function public.refresh_stats() to authenticated, anon;

-- view agregada por influencer (para listados rápidos)
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
