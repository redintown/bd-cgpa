"use client";

import { useActionState, useId } from "react";
import {
  type UniversityActionState,
} from "@/app/admin/universities/actions";
import {
  DIVISIONS,
  UNIVERSITY_FIELD_LIMITS,
  type UniversityFormValues,
} from "@/lib/validation/university";

const initialUniversityActionState: UniversityActionState = {
  error: null,
  fieldErrors: {},
  values: null,
};

const inputClassName =
  "h-12 w-full rounded-lg border border-black/[.12] bg-white px-4 text-base text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-black/[.35] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[.18] dark:bg-black dark:focus:border-white/[.45]";

interface UniversityFormProps {
  action: (
    state: UniversityActionState,
    formData: FormData,
  ) => Promise<UniversityActionState>;
  defaultValues?: UniversityFormValues;
  submitLabel: string;
  pendingLabel: string;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

export function UniversityForm({
  action,
  defaultValues,
  submitLabel,
  pendingLabel,
}: UniversityFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialUniversityActionState,
  );

  const nameId = useId();
  const shortNameId = useId();
  const slugId = useId();
  const cityId = useId();
  const divisionId = useId();
  const typeId = useId();
  const websiteId = useId();
  const formErrorId = useId();

  const values = state.values ?? defaultValues;
  const fieldErrors = state.fieldErrors;
  // Remount after a failed action so every field, including <select>s, picks
  // up the server-returned values. `defaultValue` is ignored on an already
  // mounted select, which is why Division/Type were resetting to the placeholder.
  const formKey = state.values
    ? [
        state.values.name,
        state.values.shortName,
        state.values.slug,
        state.values.city,
        state.values.division,
        state.values.type,
        state.values.website,
      ].join("\0")
    : "initial";

  return (
    <form
      key={formKey}
      action={formAction}
      noValidate
      className="flex flex-col gap-5"
    >
      {state.error ? (
        <p
          id={formErrorId}
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor={nameId} className="text-sm font-medium text-foreground">
          University name
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          maxLength={UNIVERSITY_FIELD_LIMITS.name}
          defaultValue={values?.name ?? ""}
          disabled={pending}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
          className={inputClassName}
        />
        <FieldError id={`${nameId}-error`} message={fieldErrors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={shortNameId}
          className="text-sm font-medium text-foreground"
        >
          Short name
        </label>
        <input
          id={shortNameId}
          name="shortName"
          type="text"
          required
          maxLength={UNIVERSITY_FIELD_LIMITS.shortName}
          defaultValue={values?.shortName ?? ""}
          disabled={pending}
          aria-invalid={Boolean(fieldErrors.shortName)}
          aria-describedby={
            fieldErrors.shortName ? `${shortNameId}-error` : undefined
          }
          className={inputClassName}
        />
        <FieldError id={`${shortNameId}-error`} message={fieldErrors.shortName} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={slugId} className="text-sm font-medium text-foreground">
          Slug
        </label>
        <input
          id={slugId}
          name="slug"
          type="text"
          required
          maxLength={UNIVERSITY_FIELD_LIMITS.slug}
          defaultValue={values?.slug ?? ""}
          disabled={pending}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(fieldErrors.slug)}
          aria-describedby={
            fieldErrors.slug ? `${slugId}-error ${slugId}-hint` : `${slugId}-hint`
          }
          className={inputClassName}
        />
        <p
          id={`${slugId}-hint`}
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          Lowercase letters, numbers, and hyphens only. Used in the public URL.
        </p>
        <FieldError id={`${slugId}-error`} message={fieldErrors.slug} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={cityId} className="text-sm font-medium text-foreground">
            City
          </label>
          <input
            id={cityId}
            name="city"
            type="text"
            required
            maxLength={UNIVERSITY_FIELD_LIMITS.city}
            defaultValue={values?.city ?? ""}
            disabled={pending}
            aria-invalid={Boolean(fieldErrors.city)}
            aria-describedby={fieldErrors.city ? `${cityId}-error` : undefined}
            className={inputClassName}
          />
          <FieldError id={`${cityId}-error`} message={fieldErrors.city} />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={divisionId}
            className="text-sm font-medium text-foreground"
          >
            Division
          </label>
          <select
            id={divisionId}
            name="division"
            required
            defaultValue={values?.division ?? ""}
            disabled={pending}
            aria-invalid={Boolean(fieldErrors.division)}
            aria-describedby={
              fieldErrors.division ? `${divisionId}-error` : undefined
            }
            className={inputClassName}
          >
            <option value="">Select a division</option>
            {DIVISIONS.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
          <FieldError id={`${divisionId}-error`} message={fieldErrors.division} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={typeId} className="text-sm font-medium text-foreground">
          Type
        </label>
        <select
          id={typeId}
          name="type"
          required
          defaultValue={values?.type ?? ""}
          disabled={pending}
          aria-invalid={Boolean(fieldErrors.type)}
          aria-describedby={fieldErrors.type ? `${typeId}-error` : undefined}
          className={inputClassName}
        >
          <option value="">Select a type</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <FieldError id={`${typeId}-error`} message={fieldErrors.type} />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={websiteId}
          className="text-sm font-medium text-foreground"
        >
          Website
        </label>
        <input
          id={websiteId}
          name="website"
          type="url"
          required
          maxLength={UNIVERSITY_FIELD_LIMITS.website}
          defaultValue={values?.website ?? ""}
          disabled={pending}
          placeholder="https://www.example.edu.bd/"
          aria-invalid={Boolean(fieldErrors.website)}
          aria-describedby={
            fieldErrors.website ? `${websiteId}-error` : undefined
          }
          className={inputClassName}
        />
        <FieldError id={`${websiteId}-error`} message={fieldErrors.website} />
      </div>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-foreground px-4 text-base font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
