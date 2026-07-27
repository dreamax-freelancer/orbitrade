-- Run once in the Orbit project's Supabase SQL Editor.
-- Creates a private bucket where each authenticated trader can only manage their own chart uploads.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chart-uploads',
  'chart-uploads',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Orbit users upload their own charts'
  ) then
    create policy "Orbit users upload their own charts"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'chart-uploads' and (storage.foldername(name))[1] = (select auth.uid()::text));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Orbit users read their own charts'
  ) then
    create policy "Orbit users read their own charts"
      on storage.objects for select to authenticated
      using (bucket_id = 'chart-uploads' and owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Orbit users delete their own charts'
  ) then
    create policy "Orbit users delete their own charts"
      on storage.objects for delete to authenticated
      using (bucket_id = 'chart-uploads' and owner_id = (select auth.uid()));
  end if;
end $$;
