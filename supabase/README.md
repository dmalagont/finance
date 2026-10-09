# Supabase

Migrations for the cockpit database. Apply them with the Supabase CLI (`supabase db push`) or
paste them into the SQL editor in order.

## After the first push

1. **Expose the `api` schema** to the Data API (Project Settings → API → Exposed schemas).
   It holds read-only views (`security_invoker`), so RLS still applies.
2. **Register yourself as owner** once you have signed in to the app (your auth user id):
   `insert into ops.owners (user_id) values ('<your-auth-user-uuid>');`
3. **Give the engine a connection string** with a role that bypasses RLS (the `postgres` user via
   the session pooler is simplest) and store it as `DATABASE_URL` in the engine's secrets.

## Security model

- RLS is enabled and forced on every table.
- Market, computed and reference data: readable by the owner only; written only by the engine.
- Personal rows (journal, portfolio accounts/transactions/targets, manual scores, "my" probability
  estimates): readable and writable only by the owner, for their own `auth.uid()`.
- `anon` has no access to any schema.
- A journal entry cannot be stored unless all eight red-team checks are true (table constraint).

## Test locally

```bash
supabase/tests/run_local.sh      # throwaway Postgres 16: bootstrap roles + auth.uid(), migrate, RLS tests
```
