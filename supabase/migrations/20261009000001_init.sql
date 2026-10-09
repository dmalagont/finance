-- Investment Cockpit — initial schema.
--
-- Schemas
--   ref            reference data: sources, series, indicators, thresholds, events
--   raw            observations, point-in-time (every revision kept with its realtime window)
--   signals        computed indicator series and latest readings
--   probabilities  questions and estimates, labelled by source, never blended
--   council        member reads, regime, posture
--   portfolio      accounts, instruments, transactions, prices, fund look-through
--   journal        decisions with red-team checks, manual scores
--   ops            owners, job runs, source status
--   api            read-only views for the web app (the only schema exposed via the Data API)
--
-- Security: RLS is enabled on every table. Market and computed data are readable by the
-- owner; the engine writes with the service role (bypasses RLS). Personal rows (journal,
-- portfolio) are owned by auth.uid().

create schema if not exists ref;
create schema if not exists raw;
create schema if not exists signals;
create schema if not exists probabilities;
create schema if not exists council;
create schema if not exists portfolio;
create schema if not exists journal;
create schema if not exists ops;
create schema if not exists api;

-- ── ops: owners and runs ────────────────────────────────────────────────────

create table ops.owners (
  user_id uuid primary key,
  added_at timestamptz not null default now()
);

create or replace function ops.is_owner() returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from ops.owners o where o.user_id = (select auth.uid()));
$$;

create table ops.runs (
  id bigint generated always as identity primary key,
  job text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'ok', 'partial', 'error')),
  stats jsonb not null default '{}',
  error text
);

-- ── ref ─────────────────────────────────────────────────────────────────────

create table ref.sources (
  id text primary key,
  name text not null,
  url text,
  notes text
);

create table ref.series (
  id text primary key,
  source_id text not null references ref.sources (id),
  source_key text not null,
  name text not null,
  unit text,
  frequency text not null check (frequency in ('D', 'W', 'M', 'Q', 'A')),
  params jsonb not null default '{}',
  verified boolean not null default false,
  active boolean not null default true,
  notes text
);

create table ref.indicators (
  id text primary key,
  name text not null,
  panel text not null check (panel in ('liquidity', 'macro', 'cycle', 'value', 'stress', 'norway')),
  unit text,
  frequency text not null check (frequency in ('D', 'W', 'M', 'Q', 'A')),
  risk_when text not null check (risk_when in ('higher', 'lower', 'both')),
  inputs text[] not null default '{}',
  method text not null,
  notes text
);

create table ref.thresholds (
  indicator_id text primary key references ref.indicators (id) on delete cascade,
  method text not null check (method in ('level', 'percentile')),
  watch double precision,
  alert double precision,
  direction text not null check (direction in ('higher', 'lower', 'both')),
  is_default boolean not null default true,
  note text
);

create table ref.events (
  id bigint generated always as identity primary key,
  event_date date not null,
  label text not null,
  description text
);

-- ── raw: point-in-time observations ─────────────────────────────────────────

create table raw.observations (
  series_id text not null references ref.series (id) on delete cascade,
  obs_date date not null,
  value double precision,
  realtime_start date not null,
  realtime_end date,                       -- null = still the current vintage
  ingested_at timestamptz not null default now(),
  run_id bigint references ops.runs (id) on delete set null,
  primary key (series_id, obs_date, realtime_start),
  check (realtime_end is null or realtime_end >= realtime_start)
);

create index observations_current_idx on raw.observations (series_id, obs_date) where realtime_end is null;

-- ── signals ─────────────────────────────────────────────────────────────────

create table signals.indicator_values (
  indicator_id text not null references ref.indicators (id) on delete cascade,
  obs_date date not null,
  value double precision not null,
  computed_at timestamptz not null default now(),
  run_id bigint references ops.runs (id) on delete set null,
  primary key (indicator_id, obs_date)
);

create table signals.readings (
  indicator_id text not null references ref.indicators (id) on delete cascade,
  as_of date not null,
  value double precision,
  last_obs_date date,
  change jsonb not null default '{}',      -- e.g. {"1w": .., "13w": .., "1y": ..}
  percentile double precision check (percentile is null or percentile between 0 and 100),
  zscore double precision,
  range_52w jsonb,                         -- {"low": .., "high": .., "position": 0..1}
  state text not null check (state in ('calm', 'watch', 'alert', 'incomplete')),
  status text not null check (status in ('live', 'stale', 'error', 'missing')),
  stale_days integer,
  computed_at timestamptz not null default now(),
  run_id bigint references ops.runs (id) on delete set null,
  primary key (indicator_id, as_of)
);

-- ── probabilities ───────────────────────────────────────────────────────────

create table probabilities.questions (
  id text primary key,
  text text not null,
  horizon_days integer,
  resolves_on date,
  resolution_rule text,
  resolved_at timestamptz,
  outcome boolean
);

create table probabilities.estimates (
  id bigint generated always as identity primary key,
  question_id text not null references probabilities.questions (id) on delete cascade,
  source text not null check (source in ('market', 'model', 'base', 'mine')),
  p double precision not null check (p between 0 and 1),
  p_low double precision check (p_low between 0 and 1),
  p_high double precision check (p_high between 0 and 1),
  n integer,
  method text not null,
  details jsonb not null default '{}',
  as_of date not null,
  owner uuid default auth.uid(),           -- set for 'mine' estimates only
  created_at timestamptz not null default now(),
  check ((source = 'mine') = (owner is not null))
);

create index estimates_question_idx on probabilities.estimates (question_id, source, as_of desc);

-- ── council ─────────────────────────────────────────────────────────────────

create table council.reads (
  member_id text not null,
  as_of date not null,
  score smallint check (score between 1 and 5),
  state text not null check (state in ('calm', 'watch', 'alert', 'incomplete')),
  read text,
  drivers jsonb not null default '[]',
  method text not null,
  computed_at timestamptz not null default now(),
  primary key (member_id, as_of)
);

create table council.regime (
  as_of date primary key,
  growth text check (growth in ('up', 'down')),
  inflation text check (inflation in ('up', 'down')),
  growth_score double precision,
  inflation_score double precision,
  details jsonb not null default '{}',
  method text not null,
  computed_at timestamptz not null default now()
);

create table council.posture (
  as_of date primary key,
  level smallint check (level between 0 and 4),   -- 0 Defensive … 4 Aggressive
  reasons jsonb not null default '[]',
  disagreement double precision,
  complete boolean not null default false,
  method text not null,
  computed_at timestamptz not null default now()
);

-- ── portfolio ───────────────────────────────────────────────────────────────

create table portfolio.accounts (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid(),
  name text not null,
  account_type text not null check (account_type in ('ask', 'ips', 'regular', 'other')),
  broker text,
  currency text not null default 'NOK'
);

create table portfolio.instruments (
  id uuid primary key default gen_random_uuid(),
  isin text unique,
  ticker text,
  name text not null,
  kind text not null check (kind in ('fund', 'etf', 'stock', 'bond', 'cash', 'other')),
  currency text,
  ter double precision,
  nok_hedged boolean,
  ask_eligible boolean,
  tracks_index text,
  proxy_ticker text,                       -- ETF used as daily stand-in for an index fund
  metadata jsonb not null default '{}'
);

create table portfolio.transactions (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid(),
  account_id uuid not null references portfolio.accounts (id) on delete cascade,
  instrument_id uuid references portfolio.instruments (id),
  trade_date date not null,
  kind text not null check (kind in ('buy', 'sell', 'dividend', 'fee', 'deposit', 'withdrawal', 'tax', 'other')),
  quantity double precision,
  price double precision,
  amount double precision,
  currency text,
  source_file text,
  raw jsonb,
  dedupe_key text not null,
  imported_at timestamptz not null default now(),
  unique (owner, dedupe_key)
);

create table portfolio.prices (
  instrument_id uuid not null references portfolio.instruments (id) on delete cascade,
  price_date date not null,
  close double precision not null,
  currency text,
  source text not null,
  primary key (instrument_id, price_date)
);

create table portfolio.fund_holdings (
  id bigint generated always as identity primary key,
  instrument_id uuid not null references portfolio.instruments (id) on delete cascade,
  as_of date not null,
  constituent_name text not null,
  constituent_isin text,
  weight double precision not null,
  sector text,
  country text,
  currency text,
  source text not null,
  is_proxy boolean not null default false
);

create index fund_holdings_idx on portfolio.fund_holdings (instrument_id, as_of desc);

create table portfolio.targets (
  owner uuid not null default auth.uid(),
  dimension text not null check (dimension in ('asset_class', 'region', 'sector', 'factor', 'currency')),
  bucket text not null,
  target_weight double precision not null check (target_weight between 0 and 1),
  primary key (owner, dimension, bucket)
);

-- ── journal ─────────────────────────────────────────────────────────────────

create table journal.entries (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid(),
  title text not null,
  consensus text,
  my_view text not null,
  priced_in text,
  priced_source text check (priced_source in ('market', 'model', 'base', 'mine')),
  invalidation text not null,
  premortem text,
  checks boolean[] not null default array_fill(false, array[8]),
  review_on date not null,
  snapshot jsonb not null default '{}',
  outcome text check (outcome in ('right', 'wrong', 'mixed')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The red team is mandatory: an entry exists only once all eight checks are done.
  check (array_length(checks, 1) = 8 and false <> all (checks))
);

create table journal.manual_scores (
  id bigint generated always as identity primary key,
  owner uuid not null default auth.uid(),
  kind text not null check (kind in ('temperature', 'big_cycle', 'moat', 'competence', 'other')),
  key text not null,
  score smallint not null check (score between 1 and 5),
  note text,
  as_of date not null default current_date
);

-- ── RLS ─────────────────────────────────────────────────────────────────────

do $$
declare t record;
begin
  for t in
    select schemaname, tablename from pg_tables
    where schemaname in ('ref', 'raw', 'signals', 'probabilities', 'council', 'portfolio', 'journal', 'ops')
  loop
    execute format('alter table %I.%I enable row level security', t.schemaname, t.tablename);
    execute format('alter table %I.%I force row level security', t.schemaname, t.tablename);
  end loop;
end $$;

-- Shared market / computed data: owner may read; only the service role writes.
do $$
declare t record;
begin
  for t in
    select schemaname, tablename from pg_tables
    where (schemaname in ('ref', 'raw', 'signals', 'council'))
       or (schemaname = 'probabilities' and tablename = 'questions')
       or (schemaname = 'portfolio' and tablename in ('instruments', 'prices', 'fund_holdings'))
       or (schemaname = 'ops' and tablename = 'runs')
  loop
    execute format('create policy owner_read on %I.%I for select to authenticated using ((select ops.is_owner()))', t.schemaname, t.tablename);
  end loop;
end $$;

create policy owner_read_self on ops.owners for select to authenticated using (user_id = (select auth.uid()));

-- Estimates: everyone's estimates readable by the owner; only 'mine' writable by the owner.
create policy owner_read on probabilities.estimates for select to authenticated using ((select ops.is_owner()));
create policy owner_write_mine on probabilities.estimates for insert to authenticated
  with check ((select ops.is_owner()) and source = 'mine' and owner = (select auth.uid()));
create policy owner_delete_mine on probabilities.estimates for delete to authenticated
  using ((select ops.is_owner()) and source = 'mine' and owner = (select auth.uid()));

-- Personal rows: full access to own rows, owner only.
do $$
declare t record;
begin
  for t in
    select * from (values
      ('portfolio', 'accounts'), ('portfolio', 'transactions'), ('portfolio', 'targets'),
      ('journal', 'entries'), ('journal', 'manual_scores')
    ) as v(schemaname, tablename)
  loop
    execute format(
      'create policy own_rows on %I.%I for all to authenticated using ((select ops.is_owner()) and owner = (select auth.uid())) with check ((select ops.is_owner()) and owner = (select auth.uid()))',
      t.schemaname, t.tablename);
  end loop;
end $$;

-- ── grants ──────────────────────────────────────────────────────────────────

grant usage on schema ref, raw, signals, probabilities, council, portfolio, journal, ops, api to authenticated, service_role;
grant select on all tables in schema ref, raw, signals, probabilities, council, portfolio, ops to authenticated;
grant insert, delete on probabilities.estimates to authenticated;
grant select, insert, update, delete on portfolio.accounts, portfolio.transactions, portfolio.targets to authenticated;
grant select, insert, update, delete on journal.entries, journal.manual_scores to authenticated;
grant all on all tables in schema ref, raw, signals, probabilities, council, portfolio, journal, ops to service_role;
grant usage on all sequences in schema ref, raw, signals, probabilities, council, portfolio, journal, ops to authenticated, service_role;
grant execute on function ops.is_owner() to authenticated, service_role;
revoke all on schema ref, raw, signals, probabilities, council, portfolio, journal, ops, api from anon;

-- ── updated_at ──────────────────────────────────────────────────────────────

create or replace function journal.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger entries_touch before update on journal.entries for each row execute function journal.touch_updated_at();
