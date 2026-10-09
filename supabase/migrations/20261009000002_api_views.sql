-- Read-only views for the web app. security_invoker = true so the caller's RLS applies.

create view api.current_observations with (security_invoker = true) as
  select series_id, obs_date, value, realtime_start
  from raw.observations
  where realtime_end is null;

create view api.indicator_series with (security_invoker = true) as
  select indicator_id, obs_date, value from signals.indicator_values;

create view api.readings_latest with (security_invoker = true) as
  select distinct on (r.indicator_id)
    r.indicator_id, i.name, i.panel, i.unit, i.frequency, i.risk_when,
    r.as_of, r.value, r.last_obs_date, r.change, r.percentile, r.zscore, r.range_52w,
    r.state, r.status, r.stale_days, r.computed_at
  from signals.readings r
  join ref.indicators i on i.id = r.indicator_id
  order by r.indicator_id, r.as_of desc;

create view api.council_latest with (security_invoker = true) as
  select distinct on (member_id) member_id, as_of, score, state, read, drivers, method
  from council.reads
  order by member_id, as_of desc;

create view api.posture_latest with (security_invoker = true) as
  select * from council.posture order by as_of desc limit 1;

create view api.regime_history with (security_invoker = true) as
  select as_of, growth, inflation, growth_score, inflation_score from council.regime;

create view api.estimates_latest with (security_invoker = true) as
  select distinct on (e.question_id, e.source)
    e.question_id, q.text as question, e.source, e.p, e.p_low, e.p_high, e.n, e.method, e.as_of
  from probabilities.estimates e
  join probabilities.questions q on q.id = e.question_id
  order by e.question_id, e.source, e.as_of desc, e.created_at desc;

create view api.source_status with (security_invoker = true) as
  select
    s.id as source_id,
    s.name,
    count(distinct se.id) as series,
    max(o.ingested_at) as last_ingested_at,
    max(o.obs_date) as last_obs_date
  from ref.sources s
  left join ref.series se on se.source_id = s.id and se.active
  left join raw.observations o on o.series_id = se.id and o.realtime_end is null
  group by s.id, s.name;

create view api.runs_recent with (security_invoker = true) as
  select id, job, started_at, finished_at, status, stats, error
  from ops.runs order by started_at desc limit 50;

create view api.holdings with (security_invoker = true) as
  select t.owner, t.account_id, a.name as account, a.account_type, t.instrument_id, i.name as instrument, i.isin,
         sum(case when t.kind = 'buy' then t.quantity when t.kind = 'sell' then -t.quantity else 0 end) as quantity,
         sum(case when t.kind = 'buy' then t.amount else 0 end) as cost
  from portfolio.transactions t
  join portfolio.accounts a on a.id = t.account_id
  left join portfolio.instruments i on i.id = t.instrument_id
  where t.instrument_id is not null
  group by t.owner, t.account_id, a.name, a.account_type, t.instrument_id, i.name, i.isin;

grant select on all tables in schema api to authenticated, service_role;
