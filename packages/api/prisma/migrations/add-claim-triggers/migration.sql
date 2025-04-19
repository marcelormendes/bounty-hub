-- 1. Trigger to bump counter exactly once
create or replace function public.bump_claim_counter()
returns trigger as $$
begin
  if new.status = 'APPROVED' and coalesce(old.status, '') <> 'APPROVED' then
    update public."User"
       set "claimsApprovedThisMonth" = "claimsApprovedThisMonth" + 1
     where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_claim_status
after insert or update on public."BountyClaim"
for each row execute procedure public.bump_claim_counter();

-- 2. Monthly reset (run via pg_cron or Supabase Scheduled Functions)
create or replace function public.reset_monthly_claim_counters()
returns void as $$
begin
  update public."User"
     set "claimsApprovedThisMonth" = 0,
         "claimCounterResetAt" = date_trunc('month', now()) + interval '1 month'
   where "claimCounterResetAt" <= now();
end;
$$ language plpgsql;

-- pg_cron entry (works on Supabase ≥ v2)
select
  cron.schedule('reset-claim-counters',
                '0 1 * * *',          -- 01:00 UTC daily
                $$call public.reset_monthly_claim_counters()$$); 