-- ============================================================
--  SAHIRA GOLD COLLECTION — Esquema de Base de Datos Supabase
-- ============================================================
-- Ejecuta este SQL en: Supabase → SQL Editor → New query → Run

-- ─── Extensiones ────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PERFILES DE USUARIO ────────────────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text,
  phone         text,
  address       text,
  city          text,
  state         text,
  zip           text,
  avatar_url    text,
  role          text default 'customer' check (role in ('customer', 'admin')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── CATEGORÍAS ─────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  slug        text unique not null,
  description text,
  image_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

insert into public.categories (name, slug, description, sort_order) values
  ('Anillos',    'anillos',    'Anillos de oro y piedras preciosas', 1),
  ('Collares',   'collares',   'Collares y cadenas de oro',          2),
  ('Aretes',     'aretes',     'Aretes y pendientes de lujo',        3),
  ('Pulseras',   'pulseras',   'Pulseras y brazaletes',              4),
  ('Cadenas',    'cadenas',    'Cadenas de oro 18K y 24K',           5),
  ('Conjuntos',  'conjuntos',  'Conjuntos y sets de joyería',        6)
on conflict (slug) do nothing;

-- ─── PRODUCTOS ──────────────────────────────────────────────
create table if not exists public.products (
  id              uuid default uuid_generate_v4() primary key,
  name            text not null,
  slug            text unique not null,
  description     text,
  category_id     uuid references public.categories(id),
  material        text default 'Oro 18K',
  weight          numeric(6,2),
  price           numeric(10,2) not null,
  compare_price   numeric(10,2),
  stock           int default 0,
  sku             text unique,
  images          text[] default '{}',
  is_active       boolean default true,
  is_new          boolean default false,
  is_bestseller   boolean default false,
  reviews_count   int default 0,
  rating          numeric(3,2) default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── PEDIDOS ────────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid default uuid_generate_v4() primary key,
  order_number    text unique not null default 'SGC-' || floor(random()*90000+10000)::text,
  user_id         uuid references auth.users(id),
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text,
  address         text,
  city            text,
  state           text,
  zip             text,
  subtotal        numeric(10,2) not null,
  shipping        numeric(10,2) default 0,
  discount        numeric(10,2) default 0,
  total           numeric(10,2) not null,
  payment_method  text default 'card',
  msi_months      int default 0,
  coupon_code     text,
  status          text default 'Procesando' check (status in ('Procesando','En camino','Entregado','Cancelado')),
  tracking_number text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── ITEMS DE PEDIDO ────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid default uuid_generate_v4() primary key,
  order_id    uuid references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id),
  name        text not null,
  image       text,
  price       numeric(10,2) not null,
  quantity    int not null default 1,
  subtotal    numeric(10,2) not null
);

-- ─── WISHLIST ───────────────────────────────────────────────
create table if not exists public.wishlists (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  product_id  uuid references public.products(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);

-- ─── CUPONES ────────────────────────────────────────────────
create table if not exists public.coupons (
  id            uuid default uuid_generate_v4() primary key,
  code          text unique not null,
  type          text not null check (type in ('percent', 'fixed')),
  value         numeric(10,2) not null,
  min_purchase  numeric(10,2) default 0,
  max_uses      int default 100,
  uses          int default 0,
  expires_at    date,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

insert into public.coupons (code, type, value, min_purchase, max_uses, expires_at) values
  ('SAHIRA10',   'percent', 10,  500,  100, '2026-12-31'),
  ('BIENVENIDA', 'percent', 15,  0,    500, '2026-09-01'),
  ('SAHIRA500',  'fixed',   500, 2000, 50,  '2026-07-31'),
  ('VIP2026',    'percent', 20,  5000, 30,  '2026-12-31')
on conflict (code) do nothing;

-- ─── RESEÑAS ────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  product_id  uuid references public.products(id) on delete cascade,
  user_id     uuid references auth.users(id),
  author_name text not null,
  avatar_url  text,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  location    text,
  created_at  timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table public.profiles   enable row level security;
alter table public.products    enable row level security;
alter table public.categories  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists   enable row level security;
alter table public.coupons     enable row level security;
alter table public.reviews     enable row level security;

-- Profiles: solo el propio usuario lee/edita su perfil; admins ven todo
create policy "profiles_select_own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);

-- Products & categories: lectura pública
create policy "products_public_read"    on public.products    for select using (true);
create policy "categories_public_read"  on public.categories  for select using (true);
create policy "reviews_public_read"     on public.reviews     for select using (true);
create policy "coupons_public_read"     on public.coupons     for select using (is_active = true);

-- Products admin write
create policy "products_admin_write" on public.products
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Orders: usuario ve sus propios pedidos
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);

-- Order items: ligado al pedido del usuario
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "order_items_insert_own" on public.order_items
  for insert with check (true);

-- Wishlist: solo el propio usuario
create policy "wishlist_own" on public.wishlists
  for all using (auth.uid() = user_id);

-- Reviews: insertar si autenticado
create policy "reviews_insert_auth" on public.reviews
  for insert with check (auth.uid() is not null);

-- ─── FUNCIÓN ADMIN ──────────────────────────────────────────
-- Usar en Supabase Dashboard → Authentication → Users
-- para asignar rol admin a tu cuenta:
--
-- update public.profiles set role = 'admin' where id = '<tu-user-id>';
--
-- ============================================================
