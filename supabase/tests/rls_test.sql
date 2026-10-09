-- RLS checks. Run after bootstrap + migrations; raises on failure.
\set ON_ERROR_STOP on

insert into ops.owners (user_id) values ('00000000-0000-0000-0000-000000000001');
insert into ref.sources (id, name) values ('test', 'Test source');
insert into ref.series (id, source_id, source_key, name, frequency) values ('t1', 'test', 'T1', 'Test series', 'D');
insert into raw.observations (series_id, obs_date, value, realtime_start) values ('t1', '2026-01-01', 1.0, '2026-01-02');

-- Owner can read market data and write own journal rows.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$ begin
  if (select count(*) from raw.observations) <> 1 then raise exception 'owner cannot read observations'; end if;
  if (select count(*) from api.current_observations) <> 1 then raise exception 'owner cannot read api view'; end if;
end $$;
insert into journal.entries (title, my_view, invalidation, checks, review_on)
  values ('Test decision', 'view', 'wrong if', array_fill(true, array[8]), '2027-01-01');
do $$ begin
  if (select count(*) from journal.entries) <> 1 then raise exception 'owner cannot read own journal'; end if;
end $$;

-- Owner cannot write market data.
do $$ begin
  begin
    insert into raw.observations (series_id, obs_date, value, realtime_start) values ('t1', '2026-01-02', 2.0, '2026-01-03');
    raise exception 'owner could write observations';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Journal entry without a full red team is rejected.
do $$ begin
  begin
    insert into journal.entries (title, my_view, invalidation, review_on) values ('No red team', 'v', 'i', '2027-01-01');
    raise exception 'entry without red team accepted';
  exception when check_violation then null;
  end;
end $$;

-- A different signed-in user sees nothing.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$ begin
  if (select count(*) from raw.observations) <> 0 then raise exception 'non-owner can read observations'; end if;
  if (select count(*) from journal.entries) <> 0 then raise exception 'non-owner can read journal'; end if;
end $$;

-- Anonymous has no access at all.
reset role;
set role anon;
do $$ begin
  begin
    perform 1 from raw.observations;
    raise exception 'anon can read observations';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select 'RLS tests passed' as result;
