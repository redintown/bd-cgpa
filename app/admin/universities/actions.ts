"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import {
  createUniversity,
  getUniversityByIdForAdmin,
  slugExists,
  updateUniversity,
} from "@/lib/db/admin/universities";
import {
  validateUniversityForm,
  type UniversityFormValues,
} from "@/lib/validation/university";

export interface UniversityActionState {
  error: string | null;
  fieldErrors: Partial<Record<keyof UniversityFormValues, string>>;
  values: UniversityFormValues | null;
}

function friendlyWriteError(
  code: "duplicate_slug" | "not_found" | "unauthorized" | "unknown",
): string {
  switch (code) {
    case "duplicate_slug":
      return "A university with this slug already exists.";
    case "not_found":
      return "That university could not be found.";
    case "unauthorized":
      return "You are not authorized to perform this action.";
    default:
      return "Something went wrong while saving. Please try again.";
  }
}

async function authorizeAdminWrite(): Promise<UniversityActionState | null> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return {
      error: "You are not authorized to perform this action.",
      fieldErrors: {},
      values: null,
    };
  }
  return null;
}

export async function createUniversityAction(
  _prevState: UniversityActionState,
  formData: FormData,
): Promise<UniversityActionState> {
  const unauthorized = await authorizeAdminWrite();
  if (unauthorized) {
    return unauthorized;
  }

  const validated = validateUniversityForm(formData);
  if (!validated.ok || !validated.data) {
    return {
      error: "Please fix the highlighted fields and try again.",
      fieldErrors: validated.fieldErrors,
      values: validated.values,
    };
  }

  let createdSlug: string;
  try {
    if (await slugExists(validated.data.slug)) {
      return {
        error: "A university with this slug already exists.",
        fieldErrors: { slug: "This slug is already in use." },
        values: validated.values,
      };
    }

    const result = await createUniversity(validated.data);
    if (!result.ok) {
      return {
        error: friendlyWriteError(result.error.code),
        fieldErrors:
          result.error.code === "duplicate_slug"
            ? { slug: "This slug is already in use." }
            : {},
        values: validated.values,
      };
    }
    createdSlug = result.data.slug;
  } catch (error) {
    console.error("createUniversityAction failed:", error);
    return {
      error: "Something went wrong while saving. Please try again.",
      fieldErrors: {},
      values: validated.values,
    };
  }

  revalidatePath("/admin/universities");
  revalidatePath("/");
  revalidatePath(`/universities/${createdSlug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/universities?created=1");
}

export async function updateUniversityAction(
  universityId: string,
  _prevState: UniversityActionState,
  formData: FormData,
): Promise<UniversityActionState> {
  const unauthorized = await authorizeAdminWrite();
  if (unauthorized) {
    return unauthorized;
  }

  const validated = validateUniversityForm(formData);
  if (!validated.ok || !validated.data) {
    return {
      error: "Please fix the highlighted fields and try again.",
      fieldErrors: validated.fieldErrors,
      values: validated.values,
    };
  }

  let previousSlug: string;
  let nextSlug: string;
  try {
    const existing = await getUniversityByIdForAdmin(universityId);
    if (!existing) {
      return {
        error: "That university could not be found.",
        fieldErrors: {},
        values: validated.values,
      };
    }

    if (await slugExists(validated.data.slug, universityId)) {
      return {
        error: "A university with this slug already exists.",
        fieldErrors: { slug: "This slug is already in use." },
        values: validated.values,
      };
    }

    const result = await updateUniversity(universityId, validated.data);
    if (!result.ok) {
      return {
        error: friendlyWriteError(result.error.code),
        fieldErrors:
          result.error.code === "duplicate_slug"
            ? { slug: "This slug is already in use." }
            : {},
        values: validated.values,
      };
    }

    previousSlug = existing.slug;
    nextSlug = result.data.slug;
  } catch (error) {
    console.error("updateUniversityAction failed:", error);
    return {
      error: "Something went wrong while saving. Please try again.",
      fieldErrors: {},
      values: validated.values,
    };
  }

  revalidatePath("/admin/universities");
  revalidatePath("/");
  revalidatePath(`/universities/${previousSlug}`);
  revalidatePath(`/universities/${nextSlug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/universities?updated=1");
}
