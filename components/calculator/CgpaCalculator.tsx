"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { GradeBand } from "@/types/university";
import { formatGradePoint } from "@/lib/grading";
import {
  MAX_COURSE_CREDIT,
  MAX_COURSE_NAME_LENGTH,
  buildGradePointLookup,
  calculateTotals,
  formatCredits,
  formatTwoDecimals,
} from "@/lib/cgpa";

interface CgpaCalculatorProps {
  /** Grade bands from the university's active grading policy (via Supabase). */
  gradeBands: readonly GradeBand[];
  /** Maximum of the grading scale, e.g. 4. Used for a display hint only. */
  scaleMax: number;
}

interface CourseRow {
  id: string;
  name: string;
  /** Raw input string so empty/invalid entries are representable. */
  credit: string;
  /** Selected letter grade, or "" when none is chosen. */
  grade: string;
}

interface RowErrors {
  name?: string;
  credit?: string;
  grade?: string;
}

interface RowValidation {
  errors: RowErrors;
  /** True only when the whole row is blank (silently ignored, not an error). */
  isEmpty: boolean;
  /** True when the row is complete and valid, so it counts towards the CGPA. */
  isValid: boolean;
  credit?: number;
  gradePoint?: number;
}

function createEmptyRow(id: string): CourseRow {
  return { id, name: "", credit: "", grade: "" };
}

function validateRow(
  row: CourseRow,
  lookup: Map<string, number>,
): RowValidation {
  const name = row.name.trim();
  const creditRaw = row.credit.trim();
  const grade = row.grade;

  if (name === "" && creditRaw === "" && grade === "") {
    return { errors: {}, isEmpty: true, isValid: false };
  }

  const errors: RowErrors = {};

  if (name === "") {
    errors.name = "Enter a course name.";
  } else if (name.length > MAX_COURSE_NAME_LENGTH) {
    errors.name = `Use ${MAX_COURSE_NAME_LENGTH} characters or fewer.`;
  }

  let credit: number | undefined;
  if (creditRaw === "") {
    errors.credit = "Enter the credit.";
  } else {
    const parsed = Number(creditRaw);
    if (!Number.isFinite(parsed)) {
      errors.credit = "Credit must be a number.";
    } else if (parsed <= 0) {
      errors.credit = "Credit must be greater than 0.";
    } else if (parsed > MAX_COURSE_CREDIT) {
      errors.credit = `Credit must be ${MAX_COURSE_CREDIT} or fewer.`;
    } else {
      credit = parsed;
    }
  }

  let gradePoint: number | undefined;
  if (grade === "") {
    errors.grade = "Select a grade.";
  } else if (!lookup.has(grade)) {
    errors.grade = "Select a valid grade.";
  } else {
    gradePoint = lookup.get(grade);
  }

  const isValid = Object.keys(errors).length === 0;
  return { errors, isEmpty: false, isValid, credit, gradePoint };
}

export function CgpaCalculator({ gradeBands, scaleMax }: CgpaCalculatorProps) {
  const baseId = useId();
  const nextIdRef = useRef(1);
  const [rows, setRows] = useState<CourseRow[]>(() => [createEmptyRow("row-1")]);

  const lookup = useMemo(
    () => buildGradePointLookup(gradeBands),
    [gradeBands],
  );

  const validations = useMemo(
    () => rows.map((row) => validateRow(row, lookup)),
    [rows, lookup],
  );

  const validCourses = useMemo(
    () =>
      validations.flatMap((validation) =>
        validation.isValid &&
        validation.credit !== undefined &&
        validation.gradePoint !== undefined
          ? [{ credit: validation.credit, gradePoint: validation.gradePoint }]
          : [],
      ),
    [validations],
  );

  const totals = useMemo(() => calculateTotals(validCourses), [validCourses]);
  const hasResult = validCourses.length > 0;

  function newId(): string {
    nextIdRef.current += 1;
    return `row-${nextIdRef.current}`;
  }

  function updateRow(id: string, patch: Partial<Omit<CourseRow, "id">>): void {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function addCourse(): void {
    setRows((current) => [...current, createEmptyRow(newId())]);
  }

  function removeCourse(id: string): void {
    setRows((current) => {
      if (current.length === 1) {
        // Never remove the last row; clear it instead.
        return [createEmptyRow(current[0].id)];
      }
      return current.filter((row) => row.id !== id);
    });
  }

  function reset(): void {
    setRows([createEmptyRow(newId())]);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Enter your courses to calculate your CGPA on this university&rsquo;s{" "}
        {formatTwoDecimals(scaleMax)} scale. Grade points come from the official
        grading policy above; calculations run entirely in your browser.
      </p>

      <div className="flex flex-col gap-3">
        {/* Column headers (desktop only). Each field also has its own label. */}
        <div className="hidden gap-3 px-1 sm:grid sm:grid-cols-[1fr_6rem_9rem_auto]">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Course name
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Credit
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Grade
          </span>
          <span className="sr-only">Actions</span>
        </div>

        {rows.map((row, index) => {
          const { errors } = validations[index];
          const nameId = `${baseId}-${row.id}-name`;
          const creditId = `${baseId}-${row.id}-credit`;
          const gradeId = `${baseId}-${row.id}-grade`;
          const nameErrorId = `${nameId}-error`;
          const creditErrorId = `${creditId}-error`;
          const gradeErrorId = `${gradeId}-error`;

          return (
            <fieldset
              key={row.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-black/[.08] bg-white p-4 sm:grid-cols-[1fr_6rem_9rem_auto] sm:items-start sm:border-0 sm:bg-transparent sm:p-1 dark:border-white/[.145] dark:bg-black sm:dark:bg-transparent"
            >
              <legend className="sr-only">Course {index + 1}</legend>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={nameId}
                  className="text-xs font-medium text-zinc-600 sm:sr-only dark:text-zinc-400"
                >
                  Course name
                </label>
                <input
                  id={nameId}
                  type="text"
                  value={row.name}
                  maxLength={MAX_COURSE_NAME_LENGTH + 1}
                  placeholder="e.g. CSE101"
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? nameErrorId : undefined}
                  onChange={(event) =>
                    updateRow(row.id, { name: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-black/[.12] bg-white px-3 text-base text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-black/[.35] aria-[invalid=true]:border-red-500 dark:border-white/[.18] dark:bg-black dark:focus:border-white/[.45] dark:aria-[invalid=true]:border-red-400"
                />
                {errors.name ? (
                  <p
                    id={nameErrorId}
                    className="text-xs text-red-600 dark:text-red-400"
                  >
                    <span aria-hidden="true">⚠ </span>
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={creditId}
                  className="text-xs font-medium text-zinc-600 sm:sr-only dark:text-zinc-400"
                >
                  Credit
                </label>
                <input
                  id={creditId}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={MAX_COURSE_CREDIT}
                  step="0.5"
                  value={row.credit}
                  placeholder="3"
                  aria-invalid={errors.credit ? true : undefined}
                  aria-describedby={errors.credit ? creditErrorId : undefined}
                  onChange={(event) =>
                    updateRow(row.id, { credit: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-black/[.12] bg-white px-3 text-base text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-black/[.35] aria-[invalid=true]:border-red-500 dark:border-white/[.18] dark:bg-black dark:focus:border-white/[.45] dark:aria-[invalid=true]:border-red-400"
                />
                {errors.credit ? (
                  <p
                    id={creditErrorId}
                    className="text-xs text-red-600 dark:text-red-400"
                  >
                    <span aria-hidden="true">⚠ </span>
                    {errors.credit}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={gradeId}
                  className="text-xs font-medium text-zinc-600 sm:sr-only dark:text-zinc-400"
                >
                  Grade
                </label>
                <select
                  id={gradeId}
                  value={row.grade}
                  aria-invalid={errors.grade ? true : undefined}
                  aria-describedby={errors.grade ? gradeErrorId : undefined}
                  onChange={(event) =>
                    updateRow(row.id, { grade: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-black/[.12] bg-white px-3 text-base text-foreground outline-none transition-colors focus:border-black/[.35] aria-[invalid=true]:border-red-500 dark:border-white/[.18] dark:bg-black dark:focus:border-white/[.45] dark:aria-[invalid=true]:border-red-400"
                >
                  <option value="">Select grade</option>
                  {gradeBands.map((band) => (
                    <option key={band.letter} value={band.letter}>
                      {band.letter} ({formatGradePoint(band.gradePoint)})
                    </option>
                  ))}
                </select>
                {errors.grade ? (
                  <p
                    id={gradeErrorId}
                    className="text-xs text-red-600 dark:text-red-400"
                  >
                    <span aria-hidden="true">⚠ </span>
                    {errors.grade}
                  </p>
                ) : null}
              </div>

              <div className="flex items-start sm:pt-0">
                <button
                  type="button"
                  onClick={() => removeCourse(row.id)}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-black/[.12] px-3 text-sm font-medium text-foreground transition-colors hover:bg-black/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/[.18] dark:hover:bg-white/[.06]"
                  aria-label={`Remove course ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            </fieldset>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addCourse}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          + Add course
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-black/[.12] px-4 text-sm font-medium text-foreground transition-colors hover:bg-black/[.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/[.18] dark:hover:bg-white/[.06]"
        >
          Reset
        </button>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.145] dark:bg-black"
      >
        <h3 className="text-base font-semibold text-foreground">Result</h3>
        {hasResult ? (
          <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">
                Total credits
              </dt>
              <dd className="text-2xl font-semibold tabular-nums text-foreground">
                {formatCredits(totals.totalCredits)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">
                Total quality points
              </dt>
              <dd className="text-2xl font-semibold tabular-nums text-foreground">
                {formatTwoDecimals(totals.totalQualityPoints)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">CGPA</dt>
              <dd className="text-2xl font-semibold tabular-nums text-foreground">
                {formatTwoDecimals(totals.cgpa)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Add at least one course with a valid credit and grade to see your
            CGPA.
          </p>
        )}
      </div>
    </div>
  );
}
