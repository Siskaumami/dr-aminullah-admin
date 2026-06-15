-- Supabase/PostgreSQL schema untuk CMS landing page satu halaman Dr. Aminullah
-- Jalankan di Supabase SQL Editor setelah project Supabase dibuat.

create extension if not exists pgcrypto;

create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  section_name text not null,
  section_type text not null default 'content',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists section_contents (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  title text,
  subtitle text,
  content text,
  button_text text,
  button_url text,
  image_url text,
  extra jsonb not null default '{}'::jsonb,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  public_url text not null,
  mime_type text,
  alt_text text,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  category text,
  description text,
  image_url text not null,
  image_path text,
  alt_text text,
  seo_title text,
  seo_description text,
  sort_order int not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_key text unique not null,
  meta_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  twitter_title text,
  twitter_description text,
  twitter_image_url text,
  schema_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text not null,
  institution text not null,
  subject text not null,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied')),
  read_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

-- Row Level Security bisa diaktifkan setelah Supabase Auth admin dibuat.
alter table sections enable row level security;
alter table section_contents enable row level security;
alter table media_assets enable row level security;
alter table gallery_items enable row level security;
alter table seo_settings enable row level security;
alter table contact_messages enable row level security;