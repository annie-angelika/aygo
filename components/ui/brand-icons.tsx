import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * aygo's own icon set — everything the logo implies: the four-point star that
 * marks an aygo, one landmark per Bolivian department, and the Illimani ridge
 * that closes every navy header. All are 24-grid, 2px stroke, `currentColor`,
 * with a single gold accent (`--gold`) so they sit next to Lucide icons
 * without looking foreign. Size them with `className` (`size-5`), like react-icons.
 */
export type MarkProps = SVGProps<SVGSVGElement>;

function Base({ className, children, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-[1em] shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

/** The star from the logo — the symbol of an aygo. Filled, takes `currentColor`. */
export function AygoStar({ className, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-[1em] shrink-0", className)}
      {...props}
    >
      <path d="M12 2c.6 4.6 2.8 7.4 10 10-7.2 2.6-9.4 5.4-10 10-.6-4.6-2.8-7.4-10-10 7.2-2.6 9.4-5.4 10-10z" />
    </svg>
  );
}

/** La Paz — the three peaks of Illimani. */
export function MarkLaPaz(props: MarkProps) {
  return <Base {...props}><path d="M2 20 7 9l3 5 3-9 3 6 3-4 3 13z"></path><path d="m11.3 9 1.7-2 1.7 2.6"></path><path d="M5 2c.15 1.1.7 1.7 2.3 2.2C5.7 4.7 5.15 5.3 5 6.4c-.15-1.1-.7-1.7-2.3-2.2C4.3 3.7 4.85 3.1 5 2z" fill="var(--gold)" stroke="none"></path></Base>;
}

/** Santa Cruz — the Basílica de San Lorenzo. */
export function MarkSantaCruz(props: MarkProps) {
  return <Base {...props}><path d="M3 21V7h5"></path><path d="M8 21V7"></path><path d="M16 21V7h5v14"></path><path d="M8 12l4-4 4 4"></path><path d="M12 3v3"></path><path d="M10.5 4.5h3"></path><path d="M10 21v-3a2 2 0 0 1 4 0v3"></path><path d="M2 21h20"></path><path d="M4.5 10h2"></path><path d="M17.5 10h2"></path><circle cx="12" cy="14" r="1.4" fill="var(--gold)" stroke="none"></circle></Base>;
}

/** Cochabamba — the Cristo de la Concordia. */
export function MarkCochabamba(props: MarkProps) {
  return <Base {...props}><circle cx="12" cy="3.2" r="2" fill="var(--gold)" stroke="none"></circle><path d="M1.6 8.4 12 6.6l10.4 1.8a1 1 0 0 1-.3 2L12 9.2 1.9 10.4a1 1 0 0 1-.3-2z" fill="currentColor" stroke="none"></path><path d="M9.4 6.8h5.2L16.6 21H7.4z" fill="currentColor" stroke="none"></path><path d="M4.5 21.5h15"></path></Base>;
}

/** Oruro — a Diablada mask. */
export function MarkOruro(props: MarkProps) {
  return <Base {...props}><path d="M7.5 8C5 7.5 3.5 5 4 2"></path><path d="M16.5 8c2.5-.5 4-3 3.5-6"></path><path d="M6 8h12v6.5a6 6 0 0 1-12 0z"></path><circle cx="9.5" cy="12" r="1.5" fill="var(--gold)" stroke="none"></circle><circle cx="14.5" cy="12" r="1.5" fill="var(--gold)" stroke="none"></circle></Base>;
}

/** Potosí — the Cerro Rico. */
export function MarkPotosi(props: MarkProps) {
  return <Base {...props}><path d="M2 21 12 4l10 17z"></path><circle cx="12" cy="9.5" r="1.6" fill="var(--gold)" stroke="none"></circle></Base>;
}

/** Chuquisaca — the liberty bell of Sucre. */
export function MarkChuquisaca(props: MarkProps) {
  return <Base {...props}><path d="M12 2v2"></path><path d="M7 16c0-2 0-6 1-8a4.5 4.5 0 0 1 8 0c1 2 1 6 1 8"></path><path d="M4 16h16"></path><circle cx="12" cy="19.5" r="1.8" fill="var(--gold)" stroke="none"></circle></Base>;
}

/** Tarija — a bunch of grapes. */
export function MarkTarija(props: MarkProps) {
  return <Base {...props}><path d="M12 7V3"></path><path d="M12 4.5c1.5-2.5 4-2.5 6-1-2 1.5-4 1.5-6 1z"></path><circle cx="8" cy="10" r="2.1"></circle><circle cx="12" cy="10" r="2.1"></circle><circle cx="16" cy="10" r="2.1"></circle><circle cx="10" cy="13.6" r="2.1"></circle><circle cx="14" cy="13.6" r="2.1"></circle><circle cx="12" cy="17.4" r="2.2" fill="var(--gold)" stroke="none"></circle></Base>;
}

/** Beni — a canoe on the river. */
export function MarkBeni(props: MarkProps) {
  return <Base {...props}><path d="M3 12c4 4 14 4 18 0"></path><path d="M3 12h18"></path><path d="M14 12 9 4"></path><path d="M3 19c3-2 6-2 9 0s6 2 9 0"></path><circle cx="18" cy="6" r="2.5" fill="var(--gold)" stroke="none"></circle></Base>;
}

/** Pando — the Brazil-nut tree. */
export function MarkPando(props: MarkProps) {
  return <Base {...props}><circle cx="12" cy="9" r="6"></circle><path d="M12 15v7"></path><path d="M8 22h8"></path><path d="M12 15c-2-2-3-4-3-7"></path><circle cx="17" cy="19" r="1.8" fill="var(--gold)" stroke="none"></circle></Base>;
}

/**
 * The Illimani ridge that grounds every navy header. Renders lighter navy peaks
 * rising from the bottom edge of its (relative, overflow-hidden) parent; pass
 * `className` for height. Purely decorative.
 */
export function IllimaniRidge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 390 36"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 block h-14 w-full -scale-y-100", className)}
    >
      <path d="M0 0h390v6l-28 12-22-8-30 20-26-14-34 10-30-18-22 12-38-20-30 22-24-10-30 14-22-8-24 12-30-16z" fill="#16305f" />
      <path d="M0 0h390v4l-28 10-22-6-30 16-26-11-34 8-30-14-22 9-38-16-30 18-24-8-30 11-22-6-24 9-30-13z" fill="#0f2650" />
    </svg>
  );
}
