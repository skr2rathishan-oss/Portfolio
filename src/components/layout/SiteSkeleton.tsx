// Shown while the content document is loading (ContentProvider status 'loading').
// Mirrors the header + hero layout so nothing jumps when content arrives.
function Bar({ className }: { className: string }) {
  // Only default the radius when the caller does not set one (two radius utilities would conflict).
  const radius = /(^|\s)rounded-/.test(className) ? '' : 'rounded-control ';
  return <div className={`${radius}bg-white/[0.06] ${className}`} />;
}

export default function SiteSkeleton() {
  return (
    <div className="min-h-dvh bg-canvas" aria-busy="true">
      <p role="status" className="sr-only">
        Loading…
      </p>
      <div className="h-(--header-h) border-b border-line bg-navy">
        <div className="page-container flex h-full items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Bar className="h-6 w-36 lg:justify-self-start" />
          <div className="hidden items-center gap-8 lg:flex">
            <Bar className="h-4 w-12" />
            <Bar className="h-4 w-20" />
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-24" />
            <Bar className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2 lg:justify-self-end">
            <Bar className="size-11 rounded-full sm:h-11 sm:w-40" />
            <Bar className="size-11 lg:hidden" />
          </div>
        </div>
      </div>
      <div className="page-container motion-safe:animate-pulse">
        {typeof window !== 'undefined' && window.location.pathname !== '/' ? (
          <div className="pt-10 sm:pt-14 lg:pt-16">
            <Bar className="h-10 w-64" />
            <Bar className="mt-4 h-5 w-full max-w-xl" />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <Bar className="h-72 rounded-card" />
              <Bar className="h-72 rounded-card" />
            </div>
          </div>
        ) : (
          <div className="grid items-center gap-12 pt-8 pb-14 sm:gap-14 sm:pt-12 sm:pb-16 lg:min-h-[min(calc(100svh-var(--header-h)),56rem)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12 lg:py-12 xl:gap-16">
            <div>
              <Bar className="h-7 w-64 max-w-full rounded-full sm:w-80" />
              <Bar className="mt-5 h-4 w-72 max-w-full" />
              <Bar className="mt-5 h-12 w-full max-w-md" />
              <Bar className="mt-3 h-12 w-3/5 max-w-xs" />
              <Bar className="mt-3 h-12 w-full max-w-lg" />
              <Bar className="mt-6 h-4 w-full max-w-xl" />
              <Bar className="mt-3 h-4 w-11/12 max-w-xl" />
              <Bar className="mt-3 h-4 w-2/5 max-w-xl" />
              <div className="mt-8 flex gap-4">
                <Bar className="h-12 w-44 rounded-full" />
                <Bar className="h-12 w-32 rounded-full" />
              </div>
              <div className="mt-8 flex gap-3">
                <Bar className="size-11 rounded-full" />
                <Bar className="size-11 rounded-full" />
                <Bar className="size-11 rounded-full" />
                <Bar className="size-11 rounded-full" />
              </div>
            </div>
            <div className="mx-auto grid place-items-center py-6 sm:py-8 lg:py-0">
              <Bar className="size-64 rounded-blob sm:size-76 md:size-84 xl:size-96" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
