-- Run in Supabase SQL Editor if you already have the app DB but not storage policies.
-- Requires public.is_admin() from schema.sql.

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "event_images_select_public" on storage.objects;
drop policy if exists "event_images_insert_admin" on storage.objects;
drop policy if exists "event_images_update_admin" on storage.objects;
drop policy if exists "event_images_delete_admin" on storage.objects;

create policy "event_images_select_public"
  on storage.objects for select
  using (bucket_id = 'event-images');

create policy "event_images_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and (select public.is_admin())
  );

create policy "event_images_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-images' and (select public.is_admin()))
  with check (bucket_id = 'event-images' and (select public.is_admin()));

create policy "event_images_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-images' and (select public.is_admin()));
