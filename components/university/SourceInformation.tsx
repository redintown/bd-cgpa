import { formatVerificationDate } from "@/lib/grading";
import type { VerifiedSource } from "@/types/university";

interface SourceInformationProps {
  source: VerifiedSource;
  /** Describes what the citation covers, used for the external link's label. */
  subject: string;
}

/**
 * Renders the official source and verification date behind a piece of academic
 * information. Every published policy must display one of these.
 */
export function SourceInformation({ source, subject }: SourceInformationProps) {
  return (
    <dl className="flex flex-col gap-3 rounded-xl border border-black/[.08] bg-white p-5 text-sm dark:border-white/[.145] dark:bg-black">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="font-medium text-foreground">Official source</dt>
        <dd className="min-w-0">
          <a
            href={source.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Official source document for ${subject} (opens in a new tab)`}
            className="break-all text-zinc-600 underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-zinc-400 dark:hover:text-foreground"
          >
            {source.sourceUrl}
          </a>
        </dd>
      </div>

      <div className="flex flex-col gap-1">
        <dt className="font-medium text-foreground">Last verified</dt>
        <dd className="text-zinc-600 dark:text-zinc-400">
          <time dateTime={source.verifiedAt}>
            {formatVerificationDate(source.verifiedAt)}
          </time>
          {source.verifiedBy ? ` by ${source.verifiedBy}` : null}
        </dd>
      </div>
    </dl>
  );
}
