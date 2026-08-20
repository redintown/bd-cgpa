import type { Division, UniversityType } from "@/types/university";

export const DIVISIONS: readonly Division[] = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
];

export const UNIVERSITY_TYPES: readonly UniversityType[] = ["public", "private"];

export const UNIVERSITY_FIELD_LIMITS = {
  name: 200,
  shortName: 40,
  slug: 80,
  city: 80,
  website: 500,
} as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface UniversityFormValues {
  name: string;
  shortName: string;
  slug: string;
  city: string;
  division: string;
  type: string;
  website: string;
}

export interface UniversityInput {
  name: string;
  shortName: string;
  slug: string;
  city: string;
  division: Division;
  type: UniversityType;
  website: string;
}

export interface UniversityValidationResult {
  ok: boolean;
  values: UniversityFormValues;
  fieldErrors: Partial<Record<keyof UniversityFormValues, string>>;
  data?: UniversityInput;
}

function isDivision(value: string): value is Division {
  return (DIVISIONS as readonly string[]).includes(value);
}

function isUniversityType(value: string): value is UniversityType {
  return (UNIVERSITY_TYPES as readonly string[]).includes(value);
}

function readString(formData: FormData, key: keyof UniversityFormValues): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function validateWebsite(value: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return "Enter a valid website URL, including https://.";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "Website must start with http:// or https://.";
  }

  if (parsed.hostname === "") {
    return "Enter a valid website URL, including https://.";
  }

  return null;
}

/**
 * Validates university form input on the server. All values are treated as
 * untrusted: they are trimmed, length-checked, and constrained to the domain
 * enums. The slug is normalized to lowercase before the URL-safe check.
 */
export function validateUniversityForm(
  formData: FormData,
): UniversityValidationResult {
  const values: UniversityFormValues = {
    name: readString(formData, "name").trim(),
    shortName: readString(formData, "shortName").trim(),
    slug: readString(formData, "slug").trim().toLowerCase(),
    city: readString(formData, "city").trim(),
    division: readString(formData, "division").trim(),
    type: readString(formData, "type").trim(),
    website: readString(formData, "website").trim(),
  };

  const fieldErrors: UniversityValidationResult["fieldErrors"] = {};

  if (values.name === "") {
    fieldErrors.name = "University name is required.";
  } else if (values.name.length > UNIVERSITY_FIELD_LIMITS.name) {
    fieldErrors.name = `University name must be ${UNIVERSITY_FIELD_LIMITS.name} characters or fewer.`;
  }

  if (values.shortName === "") {
    fieldErrors.shortName = "Short name is required.";
  } else if (values.shortName.length > UNIVERSITY_FIELD_LIMITS.shortName) {
    fieldErrors.shortName = `Short name must be ${UNIVERSITY_FIELD_LIMITS.shortName} characters or fewer.`;
  }

  if (values.slug === "") {
    fieldErrors.slug = "Slug is required.";
  } else if (values.slug.length > UNIVERSITY_FIELD_LIMITS.slug) {
    fieldErrors.slug = `Slug must be ${UNIVERSITY_FIELD_LIMITS.slug} characters or fewer.`;
  } else if (!SLUG_PATTERN.test(values.slug)) {
    fieldErrors.slug =
      "Slug must be lowercase letters, numbers, and hyphens only (no spaces).";
  }

  if (values.city === "") {
    fieldErrors.city = "City is required.";
  } else if (values.city.length > UNIVERSITY_FIELD_LIMITS.city) {
    fieldErrors.city = `City must be ${UNIVERSITY_FIELD_LIMITS.city} characters or fewer.`;
  }

  if (!isDivision(values.division)) {
    fieldErrors.division = "Select a valid Bangladesh division.";
  }

  if (!isUniversityType(values.type)) {
    fieldErrors.type = "Select Public or Private.";
  }

  if (values.website === "") {
    fieldErrors.website = "Website is required.";
  } else if (values.website.length > UNIVERSITY_FIELD_LIMITS.website) {
    fieldErrors.website = `Website must be ${UNIVERSITY_FIELD_LIMITS.website} characters or fewer.`;
  } else {
    const websiteError = validateWebsite(values.website);
    if (websiteError) {
      fieldErrors.website = websiteError;
    }
  }

  const ok = Object.keys(fieldErrors).length === 0;
  if (!ok) {
    return { ok: false, values, fieldErrors };
  }

  return {
    ok: true,
    values,
    fieldErrors,
    data: {
      name: values.name,
      shortName: values.shortName,
      slug: values.slug,
      city: values.city,
      division: values.division as Division,
      type: values.type as UniversityType,
      website: values.website,
    },
  };
}
