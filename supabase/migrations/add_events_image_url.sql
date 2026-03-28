-- Run once if you already applied schema.sql before image support was added.
alter table public.events
  add column if not exists image_url text;

comment on column public.events.image_url is 'HTTPS image URL (e.g. Supabase Storage or CDN).';
