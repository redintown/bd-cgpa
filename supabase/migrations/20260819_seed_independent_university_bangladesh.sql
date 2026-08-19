-- Seed: Independent University, Bangladesh (IUB)
--
-- Source of every value below (verified 2026-08-19):
--   Office of the Registrar, Independent University, Bangladesh —
--   "Notification regarding Summer 2024 Trimester Grade Submission",
--   section "Uniform Grading System".
--   https://ims.iub.edu.bd/document/notification-regarding-summer-2024-trimester-grade-submission-fe91bb9d-5633-4a0a-b336-ecd597dedcd0.pdf
--
--   Corroborated by the IUB Academic Repository Green Book (Spring 2023),
--   section "Explanation of Grading System":
--   https://ar.iub.edu.bd/bitstream/handle/11348/554/GreenBook_Sp23.pdf?isAllowed=y&sequence=1
--
-- Marks bounds follow the source wording exactly: `min_marks` is the inclusive
-- lower bound and `max_marks` is the EXCLUSIVE upper bound ("85% to less than
-- 90%"). `NULL` means the source states no bound on that side ("90% and above",
-- "Less than 45%").
--
-- The source also defines non-numerical/status grades (I, W, Y, O, Z, P, S, U,
-- T, R, E). They carry no percentage range, so they are NOT inserted as grade
-- bands; they are recorded verbatim in `grading_policies.notes` instead.
--
-- Run this with elevated privileges (Supabase SQL editor or `supabase db push`).
-- It performs no schema or RLS changes and is safe to re-run.

do $$
declare
  v_university_id uuid;
  v_policy_id uuid;
  v_source_url constant text :=
    'https://ims.iub.edu.bd/document/notification-regarding-summer-2024-trimester-grade-submission-fe91bb9d-5633-4a0a-b336-ecd597dedcd0.pdf';
  v_verified_at constant timestamptz := timestamptz '2026-08-19 00:00:00+06';
  v_policy_name constant text := 'Uniform Grading System';
  v_notes constant text :=
    'Non-numerical/status grades defined by the same source. They carry no '
    || 'percentage range and a grade point of 0.00: I = Incomplete; '
    || 'W = Withdrawal; Y = Audit; O = Administrative Withdrawal; '
    || 'Z = No Grade Received; P = Pass; S = Satisfactory; U = Unsatisfactory; '
    || 'T = Repeated (Credit Not Allowed); R = Repeated (Credit Allowed); '
    || 'E = Examination.';
begin
  select id into v_university_id
  from public.universities
  where slug = 'iub';

  if v_university_id is null then
    insert into public.universities (slug, name, short_name, city, division, type, website)
    values (
      'iub',
      'Independent University, Bangladesh',
      'IUB',
      'Dhaka',
      'Dhaka',
      'private',
      'https://www.iub.edu.bd/'
    )
    returning id into v_university_id;
  end if;

  select id into v_policy_id
  from public.grading_policies
  where university_id = v_university_id
    and name = v_policy_name;

  if v_policy_id is null then
    -- effective_from/effective_to are left NULL: the source does not state the
    -- dates on which this policy took effect.
    insert into public.grading_policies (
      university_id, name, scale_max, is_active, notes, source_url, verified_at
    )
    values (
      v_university_id, v_policy_name, 4.00, true, v_notes, v_source_url, v_verified_at
    )
    returning id into v_policy_id;
  else
    update public.grading_policies
    set scale_max = 4.00,
        is_active = true,
        notes = v_notes,
        source_url = v_source_url,
        verified_at = v_verified_at
    where id = v_policy_id;
  end if;

  delete from public.grade_bands where grading_policy_id = v_policy_id;

  insert into public.grade_bands (
    grading_policy_id, letter, grade_point, min_marks, max_marks, remark, sort_order
  )
  values
    (v_policy_id, 'A',  4.00, 90,   null, 'Excellent',          1),
    (v_policy_id, 'A-', 3.70, 85,   90,   'Excellent',          2),
    (v_policy_id, 'B+', 3.30, 80,   85,   'Good',               3),
    (v_policy_id, 'B',  3.00, 75,   80,   'Good',               4),
    (v_policy_id, 'B-', 2.70, 70,   75,   'Good',               5),
    (v_policy_id, 'C+', 2.30, 65,   70,   'Passing',            6),
    (v_policy_id, 'C',  2.00, 60,   65,   'Passing',            7),
    (v_policy_id, 'C-', 1.70, 55,   60,   'Passing',            8),
    (v_policy_id, 'D+', 1.30, 50,   55,   'Deficient Passing',  9),
    (v_policy_id, 'D',  1.00, 45,   50,   'Deficient Passing', 10),
    (v_policy_id, 'F',  0.00, null, 45,   'Failing',           11);
end
$$;
