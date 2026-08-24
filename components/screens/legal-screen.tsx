import { SiteFooter } from "@/components/layout/site-footer";
import type { LegalDoc } from "@/lib/legal-content";

/**
 * Generic long-form legal page (Terms, Privacy). Pure presentation: a header
 * with the document title and "last updated" line, then numbered sections.
 * Copy lives in `lib/legal-content.ts` so the layout is shared.
 */
export function LegalScreen({ title, updated, sections }: LegalDoc) {
  return (
    <>
      <article className="flex flex-col gap-6 px-4 pt-4 pb-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-[12px] text-muted-foreground">
            Last updated: {updated}
          </p>
        </header>

        {sections.map(({ heading, body }, i) => (
          <section key={heading} className="flex flex-col gap-2">
            <h2 className="text-[15px] font-semibold text-foreground">
              {i + 1}. {heading}
            </h2>
            {body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-[13.5px] leading-relaxed text-foreground/80"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>

      <SiteFooter />
    </>
  );
}
