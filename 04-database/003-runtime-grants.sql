-- AUTH-003 runtime grants for the configured Authority database role.
-- Apply after 001 and 002 using the same DATABASE_URL role as the Authority runtime.
-- RLS remains enabled/forced; these grants do not bypass row policies.

grant usage on schema custom_authorityengine to current_user;
grant select, insert, update, delete on all tables in schema custom_authorityengine to current_user;
grant usage, select, update on all sequences in schema custom_authorityengine to current_user;
grant execute on all functions in schema custom_authorityengine to current_user;

-- Keep privileges on future objects created by this migration role.
alter default privileges in schema custom_authorityengine grant select, insert, update, delete on tables to current_user;
alter default privileges in schema custom_authorityengine grant usage, select, update on sequences to current_user;
alter default privileges in schema custom_authorityengine grant execute on functions to current_user;
