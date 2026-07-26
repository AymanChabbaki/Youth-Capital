-- 003_rls_policies_example.sql
-- Example policies for jiha_casablanca.ideas — repeat the same shape
-- for every jiha schema (or generalize into the create_jiha_schema
-- function once the pattern is confirmed).
--
-- Rule being enforced: the full row (with pdf_url + contact_info) is
-- only readable by the founder, an approved collaborator, the
-- regional coordinator of that department, the national lead of that
-- department, or national leadership. Everyone else reads
-- jiha_casablanca.ideas_public instead, which excludes those columns.

create policy "full row visible to insiders"
on jiha_casablanca.ideas
for select
using (
  founder_id = auth.uid()
  or exists (
    select 1 from jiha_casablanca.idea_collaborators c
    where c.idea_id = ideas.id and c.user_id = auth.uid()
  )
  or exists (
    select 1 from jiha_casablanca.departments d
    where d.id = ideas.department_id and d.coordinator_user_id = auth.uid()
  )
  or exists (
    select 1 from public.national_roles nr
    join jiha_casablanca.departments d on d.department_catalog_id = nr.department_id
    where d.id = ideas.department_id
      and nr.user_id = auth.uid()
      and nr.role = 'national_lead'
  )
  or exists (
    select 1 from public.national_roles nr
    where nr.user_id = auth.uid() and nr.role = 'leadership'
  )
);

create policy "founder manages own idea"
on jiha_casablanca.ideas
for update
using (founder_id = auth.uid());

create policy "members create ideas"
on jiha_casablanca.ideas
for insert
with check (founder_id = auth.uid());

-- Collaboration requests: requester and founder can see the request;
-- only the founder can approve/reject it.
create policy "requester and founder see the request"
on jiha_casablanca.collab_requests
for select
using (
  requester_id = auth.uid()
  or exists (
    select 1 from jiha_casablanca.ideas i
    where i.id = collab_requests.idea_id and i.founder_id = auth.uid()
  )
);

create policy "founder decides the request"
on jiha_casablanca.collab_requests
for update
using (
  exists (
    select 1 from jiha_casablanca.ideas i
    where i.id = collab_requests.idea_id and i.founder_id = auth.uid()
  )
);
