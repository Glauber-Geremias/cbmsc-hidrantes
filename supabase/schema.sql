-- =======================================================================
-- Hidrantes CBMSC — estrutura do banco (Supabase / PostgreSQL)
-- Execute este arquivo inteiro no SQL Editor do Supabase, uma única vez.
--
-- Regras de acesso:
--   * Qualquer pessoa (sem login) pode CONSULTAR os hidrantes.
--   * Só usuários cadastrados na tabela "gestores" podem cadastrar,
--     editar ou excluir — e apenas nas cidades da sua unidade.
--   * Gestores com admin = true podem editar qualquer cidade.
-- =======================================================================

-- ---------- Gestores (quem pode editar e em quais cidades) ----------
create table public.gestores (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  unidade    text not null,                 -- ex.: '17º BBM / 1ª Cia'
  cidades    text[] not null default '{}',  -- grafia idêntica à usada nos hidrantes
  admin      boolean not null default false,
  criado_em  timestamptz not null default now()
);

alter table public.gestores enable row level security;

create policy "gestor consulta o proprio cadastro"
  on public.gestores for select to authenticated
  using (user_id = auth.uid());

grant select on public.gestores to authenticated;

-- ---------- Hidrantes ----------
create table public.hidrantes (
  id             bigint generated always as identity primary key,
  cidade         text not null,
  bairro         text not null default '',
  endereco       text not null,
  lat            double precision not null check (lat between -90 and 90),
  lng            double precision not null check (lng between -180 and 180),
  referencia     text not null default '',
  condicao       text not null default 'ok' check (condicao in ('ok', 'warn', 'bad')),
  estado         text not null default '',  -- descrição da situação
  vazao          text not null default '',
  alteracoes     text not null default '',
  link           text not null default '',
  atualizado_em  timestamptz not null default now(),
  atualizado_por uuid references auth.users(id) on delete set null
);

create index hidrantes_cidade_idx on public.hidrantes (cidade);

alter table public.hidrantes enable row level security;

-- Verdadeiro se o usuário logado é gestor da cidade (ou admin).
create or replace function public.pode_editar_cidade(c text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.gestores g
    where g.user_id = auth.uid()
      and (g.admin or c = any (g.cidades))
  );
$$;

create policy "leitura publica"
  on public.hidrantes for select to anon, authenticated
  using (true);

create policy "gestor cadastra na sua cidade"
  on public.hidrantes for insert to authenticated
  with check (public.pode_editar_cidade(cidade));

create policy "gestor edita na sua cidade"
  on public.hidrantes for update to authenticated
  using (public.pode_editar_cidade(cidade))
  with check (public.pode_editar_cidade(cidade));

create policy "gestor exclui na sua cidade"
  on public.hidrantes for delete to authenticated
  using (public.pode_editar_cidade(cidade));

grant select on public.hidrantes to anon, authenticated;
grant insert, update, delete on public.hidrantes to authenticated;

-- Registra automaticamente quem alterou e quando.
create or replace function public.hidrantes_carimbo()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  new.atualizado_por := auth.uid();
  return new;
end;
$$;

create trigger hidrantes_carimbo
  before insert or update on public.hidrantes
  for each row execute function public.hidrantes_carimbo();
