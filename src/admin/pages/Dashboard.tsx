import { AlertTriangle, ArrowRight, CheckCircle2, MousePointerClick } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Content } from '../../content/types';
import { NAV, PublishControls } from '../shell/Layout';
import { useAdminContent, useDoc } from '../state/AdminContentContext';
import { cx, focusRing, PageHeader, Panel } from '../ui/primitives';

interface Check {
  message: string;
  to: string;
}

function contentChecks(doc: Content): Check[] {
  const out: Check[] = [];
  const noImage = doc.projects.filter((p) => !p.image);
  if (noImage.length) out.push({ message: `${noImage.length} project(s) have no image`, to: 'projects' });
  const noAlt = doc.projects.filter((p) => p.image && !p.imageAlt);
  if (noAlt.length) out.push({ message: `${noAlt.length} project image(s) have no alt text`, to: 'projects' });
  const achNoImage = doc.achievements.filter((a) => !a.image);
  if (achNoImage.length) out.push({ message: `${achNoImage.length} achievement(s) have no image`, to: 'achievements' });
  const roleNoImage = doc.roles.filter((r) => !r.logo && !r.image);
  if (roleNoImage.length) out.push({ message: `${roleNoImage.length} role(s) have no logo or image`, to: 'achievements' });
  if (!doc.site.cv) out.push({ message: 'No CV is uploaded, so the Résumé button is hidden', to: 'site' });
  if (!doc.socials.some((s) => s.visible && s.showInHero && s.url)) out.push({ message: 'No social links are shown in the hero', to: 'socials' });
  return out;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function Dashboard() {
  const doc = useDoc();
  const { publishedRev, publishedUpdatedAt, updatedAt, hasUnpublishedChanges } = useAdminContent();
  const checks = contentChecks(doc);
  const sections = NAV.filter((n) => n.count);
  const hiddenCount = (
    ['projects', 'achievements', 'roles', 'programs', 'certifications', 'education', 'technologies', 'socials'] as const
  ).reduce((sum, key) => sum + (doc[key] as { visible: boolean }[]).filter((i) => !i.visible).length, 0);

  return (
    <>
      <PageHeader
        title={`Hi, ${doc.profile.fullName.split(' ')[0] || 'there'}`}
        description="Edit in the visual editor or any section from the menu. Changes save to your private draft; visitors see them after you publish."
      />

      <section
        aria-labelledby="publish-status-title"
        className={cx(
          'mb-4 flex flex-wrap items-center gap-4 rounded-2xl border p-5',
          hasUnpublishedChanges ? 'border-[#f5b544]/40 bg-[#f5b544]/[0.06]' : 'border-[#1b3550] bg-[#0b1c2e]',
        )}
      >
        <div className="min-w-0 flex-1">
          <h2 id="publish-status-title" className="text-base font-semibold text-white">
            {hasUnpublishedChanges ? 'Your draft has unpublished changes' : 'The live site is up to date'}
          </h2>
          <p className="mt-1 text-sm text-[#8ea6bd]">
            {hasUnpublishedChanges
              ? `Draft saved ${updatedAt ? dateFormat.format(new Date(updatedAt)) : 'recently'}. Publish to show it to visitors, or discard it to go back to the live version.`
              : 'Your draft matches what visitors see.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/editor"
            className={cx('inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#27496b] bg-[#11263d] px-3 text-[13px] text-[#e8f0f7] hover:border-[#3a6690]', focusRing)}
          >
            <MousePointerClick size={14} aria-hidden="true" /> Open visual editor
          </Link>
          <PublishControls showStatus={false} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#1b3550] bg-[#0b1c2e] p-5">
          <p className="text-sm text-[#8ea6bd]">Live content</p>
          <p className="mt-1 text-lg font-semibold text-white">{publishedRev === 0 ? 'Built-in content' : `Revision ${publishedRev}`}</p>
        </div>
        <div className="rounded-2xl border border-[#1b3550] bg-[#0b1c2e] p-5">
          <p className="text-sm text-[#8ea6bd]">Last published</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {publishedRev > 0 && publishedUpdatedAt ? dateFormat.format(new Date(publishedUpdatedAt)) : 'Never'}
          </p>
        </div>
        <div className="rounded-2xl border border-[#1b3550] bg-[#0b1c2e] p-5">
          <p className="text-sm text-[#8ea6bd]">Hidden items</p>
          <p className="mt-1 text-lg font-semibold text-white">{hiddenCount}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Sections">
          <ul className="grid gap-2 sm:grid-cols-2">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.to}>
                  <Link
                    to={`/admin/${s.to}`}
                    className={cx(
                      'group flex items-center gap-3 rounded-xl border border-[#1b3550] px-4 py-3 transition-colors hover:border-[#00abf0]/50 hover:bg-[#00abf0]/5',
                      focusRing,
                    )}
                  >
                    <Icon size={18} className="text-[#00abf0]" aria-hidden="true" />
                    <span className="flex-1 text-sm text-white">{s.label}</span>
                    <span className="text-sm tabular-nums text-[#7f97ad]">{s.count?.(doc)}</span>
                    <ArrowRight size={15} className="text-[#5f7a93] group-hover:text-[#00abf0]" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Checks">
          {checks.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-[#6ee7b4]">
              <CheckCircle2 size={16} aria-hidden="true" /> Everything looks complete.
            </p>
          ) : (
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.message}>
                  <Link to={`/admin/${c.to}`} className={cx('flex items-start gap-2 rounded-lg p-1.5 text-sm text-[#f5c46a] hover:bg-white/[0.04]', focusRing)}>
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {c.message}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
