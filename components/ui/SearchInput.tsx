/**
 * Presentational search input.
 *
 * Purely presentational: it renders a labelled text field and forwards value
 * changes to the parent. It holds no state of its own, so it can be used either
 * uncontrolled (omit `value`/`onChange`) or controlled by a Client Component.
 */
interface SearchInputProps {
  id?: string;
  label: string;
  placeholder?: string;
  /** Renders the field as non-interactive. */
  disabled?: boolean;
  /** Controlled value. When provided, `onChange` should be provided too. */
  value?: string;
  /** Called with the new value on every change. */
  onChange?: (value: string) => void;
  /** id of an element (e.g. a live status region) describing the input. */
  describedById?: string;
  /** Visually hide the label while keeping it available to screen readers. */
  hideLabel?: boolean;
}

export function SearchInput({
  id = "university-search",
  label,
  placeholder,
  disabled = false,
  value,
  onChange,
  describedById,
  hideLabel = false,
}: SearchInputProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor={id}
        className={
          hideLabel
            ? "sr-only"
            : "text-sm font-medium text-foreground"
        }
      >
        {label}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-describedby={describedById}
        {...(value !== undefined ? { value } : {})}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="h-12 w-full rounded-lg border border-black/[.12] bg-white px-4 text-base text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-black/[.35] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[.18] dark:bg-black dark:focus:border-white/[.45]"
      />
    </div>
  );
}
