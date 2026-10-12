// Shared class recipes so buttons, chips and cards look the same on every page.

/** Filled accent button: the one primary action in a view. */
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full bg-accent text-on-accent text-sm font-semibold ' +
  'transition-colors duration-150 hover:bg-accent-hover active:translate-y-px disabled:opacity-60 disabled:pointer-events-none';

/** Outlined button for secondary actions. */
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full border border-line-strong text-ink text-sm font-semibold ' +
  'transition-colors duration-150 hover:border-ink hover:bg-white/[0.04] active:translate-y-px';

/** Pink-outlined header CV button. Hover fills pink with dark text (white on pink fails contrast). */
export const btnSignalOutline =
  'inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-signal text-signal text-sm font-semibold ' +
  'shadow-[0_0_15px_rgb(255_0_79/0.2)] transition-[background-color,color,box-shadow] duration-200 ' +
  'hover:bg-signal hover:text-canvas hover:shadow-[0_0_22px_rgb(255_0_79/0.5)] active:translate-y-px';

/** Quiet text action with a 44px hit area. */
export const btnQuiet =
  'inline-flex items-center gap-2 min-h-11 px-1 text-sm font-semibold text-ink-2 underline-offset-4 ' +
  'transition-colors duration-150 hover:text-ink hover:underline';

/** Inline text link inside prose. */
export const textLink = 'text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent';

/** Resting card surface. */
export const card = 'rounded-card bg-surface border border-line';

/** Small static tag (skills, kinds). */
export const tag =
  'inline-flex items-center gap-1 rounded-chip border border-line bg-white/[0.03] px-2 py-0.5 text-xs font-medium text-ink-2';

/** Page heading block spacing. */
export const pageHeader = 'pt-10 sm:pt-14 lg:pt-16 max-w-3xl';
