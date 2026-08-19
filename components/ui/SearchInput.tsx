/**
 * Presentational search input.
 *
 * This is UI only — search behaviour is not wired up yet. It renders a
 * labelled text field that will later be connected to university search.
 */
interface SearchInputProps {
  id?: string;
  label: string;
  placeholder?: string;
  /** Renders the field as non-interactive while functionality is pending. */
  disabled?: boolean;
}

export function SearchInput({
  id = "university-search",
  label,
  placeholder,
  disabled = false,
}: SearchInputProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="h-12 w-full rounded-lg border border-black/[.12] bg-white px-4 text-base text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-black/[.35] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[.18] dark:bg-black dark:focus:border-white/[.45]"
      />
    </div>
  );
}
