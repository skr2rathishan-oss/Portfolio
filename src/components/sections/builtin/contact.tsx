import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Copy, Mail, MapPin, Send } from 'lucide-react';
import { useContent } from '../../../content/ContentProvider';
import { T, useEd } from '../../../content/editable';
import type { BuiltinSection } from '../../../content/types';
import { SOCIAL_ICONS } from '../../../content/icons';
import { cx, linkProps, NewTabHint } from '../../cards/shared';
import PageHeader from '../../layout/PageHeader';
import { applyStyle, bodyRules } from '../sectionStyle';
import { btnPrimary, btnSecondary } from '../../ui/styles';

const ACCESS_KEY: string | undefined = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || undefined;
const ENDPOINT = 'https://api.web3forms.com/submit';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 2000;

type Field = 'name' | 'email' | 'subject' | 'message';
type Errors = Partial<Record<Field, string>>;
type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your email address so I can reply.';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter an email address like name@example.com.';
  if (values.message.trim().length < 10) errors.message = 'Write a message of at least 10 characters.';
  return errors;
}

function readValues(form: HTMLFormElement): Record<Field, string> {
  const data = new FormData(form);
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    subject: String(data.get('subject') ?? ''),
    message: String(data.get('message') ?? ''),
  };
}

const inputClass =
  'block w-full min-h-11 rounded-control border border-line-strong bg-canvas/60 px-3.5 py-2.5 text-base text-ink placeholder:text-ink-3 ' +
  'transition-colors focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'aria-[invalid=true]:border-danger read-only:opacity-70';

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  if (typeof navigator === 'undefined' || !navigator.clipboard) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 2500);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink"
    >
      {copied ? <Check size={16} aria-hidden="true" className="text-success" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      <span className="sr-only"> email address</span>
    </button>
  );
}

type Props = { section: BuiltinSection };

export function ContactHeader({ section }: Props) {
  const { profile } = useContent();
  const ed = useEd();
  const { contact } = profile;
  const heading = [contact.heading, contact.headingAccent].filter(Boolean).join(' ') || 'Contact';
  return (
    <PageHeader
      title={heading}
      lead={contact.intro || undefined}
      attrs={ed(T.section(section.id), 'section')}
      titleAttrs={ed(T.profile('contact.heading'), 'field')}
      leadAttrs={ed(T.profile('contact.intro'), 'text')}
    />
  );
}

const mainClass = 'mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14';

export function ContactMain({ section }: Props) {
  const { profile, socials } = useContent();
  const ed = useEd();
  const { contact } = profile;
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [messageLength, setMessageLength] = useState(0);

  const mailto = contact.email ? `mailto:${contact.email}` : undefined;
  const place = [contact.location, contact.timezone].filter(Boolean).join(', ');
  const links = socials.filter((s) => s.showInContact && !['email', 'location'].includes(s.platform));

  const id = (f: Field) => `${uid}-${f}`;
  const describedBy = (f: Field, extra?: string) =>
    [errors[f] ? `${id(f)}-error` : null, extra].filter(Boolean).join(' ') || undefined;

  const onBlur = (field: Field) => {
    const form = formRef.current;
    if (!form || !errors[field]) return; // only re-validate a field that already shows an error
    const next = validate(readValues(form));
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === 'sending' || !ACCESS_KEY) return;
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real visitors never see or tick this box.
    if (data.get('botcheck')) {
      setStatus({ kind: 'sent' });
      form.reset();
      return;
    }

    const values = readValues(form);
    const found = validate(values);
    setErrors(found);
    const firstInvalid = (['name', 'email', 'message'] as Field[]).find((f) => found[f]);
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus();
      setStatus({ kind: 'idle' });
      return;
    }

    setStatus({ kind: 'sending' });
    const payload = new FormData();
    payload.append('access_key', ACCESS_KEY);
    payload.append('name', values.name.trim());
    payload.append('email', values.email.trim());
    payload.append('subject', values.subject.trim() || `Portfolio message from ${values.name.trim()}`);
    payload.append('message', values.message.trim());
    payload.append('from_name', `${profile.fullName} portfolio`);

    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: payload, headers: { Accept: 'application/json' } });
      const body = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
      if (res.ok && body?.success) {
        setStatus({ kind: 'sent' });
        form.reset();
        setMessageLength(0);
        return;
      }
      setStatus({
        kind: 'error',
        message: `The message service didn't accept the message${body?.message ? ` (${body.message})` : ''}.`,
      });
    } catch {
      setStatus({ kind: 'error', message: "Couldn't reach the message service. Check your connection and try again." });
    }
  };

  const sending = status.kind === 'sending';

  return (
      <div
        {...ed(T.section(section.id), 'section')}
        className={applyStyle(mainClass, section.style, bodyRules({ spaceTop: 'mt-10 sm:mt-12' }))}
      >
        {/* Direct contact details */}
        <section aria-labelledby="contact-details-heading" className="min-w-0">
          <h2 id="contact-details-heading" className="sr-only">
            Contact details
          </h2>

          {contact.availability.enabled && contact.availability.title && (
            <div
              {...ed(T.profile('contact.availability'), 'field')}
              className="mb-6 flex items-start gap-3 rounded-card border border-success/25 bg-success/[0.06] px-4 py-3">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-success" />
              <div>
                <p className="font-medium text-ink">{contact.availability.title}</p>
                {contact.availability.subtitle && <p className="text-sm text-ink-2">{contact.availability.subtitle}</p>}
              </div>
            </div>
          )}

          <dl className="border-t border-line">
            {contact.email && (
              <div className="flex items-center gap-3 border-b border-line py-3">
                <Mail size={18} aria-hidden="true" className="shrink-0 text-ink-3" />
                <div className="min-w-0 flex-1">
                  <dt className="text-xs text-ink-3">Email</dt>
                  <dd className="min-w-0">
                    <a
                      {...ed(T.profile('contact.email'), 'text')}
                      href={mailto}
                      className="inline-block max-w-full break-all py-0.5 font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                    >
                      {contact.email}
                    </a>
                  </dd>
                </div>
                <CopyEmail email={contact.email} />
              </div>
            )}
            {place && (
              <div className="flex items-center gap-3 border-b border-line py-3">
                <MapPin size={18} aria-hidden="true" className="shrink-0 text-ink-3" />
                <div>
                  <dt className="text-xs text-ink-3">Based in</dt>
                  <dd {...ed(T.profile('contact.location'), 'field')} className="font-medium text-ink">
                    {place}
                  </dd>
                </div>
              </div>
            )}
          </dl>

          {links.length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-medium text-ink-2">Elsewhere</h3>
              <ul className="mt-2 border-t border-line">
                {links.map((s) => {
                  const Icon = SOCIAL_ICONS[s.platform];
                  const inner = (
                    <>
                      <Icon size={18} aria-hidden="true" className="shrink-0 text-ink-3 transition-colors group-hover:text-accent" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">{s.label}</span>
                        {s.handle && <span className="block truncate text-sm text-ink-2">{s.handle}</span>}
                      </span>
                    </>
                  );
                  return (
                    <li key={s.id} {...ed(T.item('socials', s.id), 'item')} className="border-b border-line">
                      {s.url ? (
                        <a
                          {...linkProps(s.url)}
                          className={cx(
                            applyStyle('group flex min-h-14 items-center gap-3 py-2', s.style, [{ key: 'emphasis' }]),
                            s.style?.emphasis === 'accent' && 'my-1 rounded-control border px-3',
                          )}
                        >
                          {inner}
                          <ArrowUpRight
                            size={16}
                            aria-hidden="true"
                            className="shrink-0 text-ink-3 transition-colors group-hover:text-ink"
                          />
                          <NewTabHint url={s.url} />
                        </a>
                      ) : (
                        <div className="flex min-h-14 items-center gap-3 py-2">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        {/* Message form */}
        <section aria-labelledby="contact-form-heading" className="min-w-0 rounded-panel border border-line bg-surface p-5 sm:p-7">
          <h2 id="contact-form-heading" className="text-h3 text-ink">
            Send a message
          </h2>

          {!ACCESS_KEY ? (
            <div className="mt-3">
              <p className="text-ink-2">
                The contact form isn't available right now. Email me directly
                {contact.email ? (
                  <>
                    {' '}at <span className="font-medium text-ink break-all">{contact.email}</span>
                  </>
                ) : null}{' '}
                and I'll get back to you.
              </p>
              {mailto && (
                <a href={mailto} className={cx(btnPrimary, 'mt-5')}>
                  <Mail size={16} aria-hidden="true" />
                  Write an email
                </a>
              )}
            </div>
          ) : (
            <form
              ref={formRef}
              noValidate
              onSubmit={onSubmit}
              onInput={() => status.kind === 'sent' && setStatus({ kind: 'idle' })}
              aria-busy={sending}
              aria-describedby={`${uid}-required-note`}
              className="mt-5 space-y-5"
            >
              <p id={`${uid}-required-note`} className="text-sm text-ink-3">
                All fields except subject are required.
              </p>

              {/* Honeypot (hidden from people and assistive tech). */}
              <input
                type="checkbox"
                name="botcheck"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                style={{ display: 'none' }}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor={id('name')} className="mb-2 block text-sm font-medium text-ink-2">
                    Your name
                  </label>
                  <input
                    id={id('name')}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={120}
                    readOnly={sending}
                    aria-invalid={!!errors.name}
                    aria-describedby={describedBy('name')}
                    onBlur={() => onBlur('name')}
                    className={inputClass}
                  />
                  {errors.name && (
                    <p id={`${id('name')}-error`} className="mt-1.5 text-sm text-danger">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={id('email')} className="mb-2 block text-sm font-medium text-ink-2">
                    Email
                  </label>
                  <input
                    id={id('email')}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    placeholder="you@company.com"
                    readOnly={sending}
                    aria-invalid={!!errors.email}
                    aria-describedby={describedBy('email')}
                    onBlur={() => onBlur('email')}
                    className={inputClass}
                  />
                  {errors.email && (
                    <p id={`${id('email')}-error`} className="mt-1.5 text-sm text-danger">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor={id('subject')} className="mb-2 block text-sm font-medium text-ink-2">
                  Subject <span className="font-normal text-ink-3">(optional)</span>
                </label>
                <input
                  id={id('subject')}
                  name="subject"
                  type="text"
                  maxLength={150}
                  readOnly={sending}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={id('message')} className="mb-2 block text-sm font-medium text-ink-2">
                  Message
                </label>
                <textarea
                  id={id('message')}
                  name="message"
                  rows={6}
                  required
                  spellCheck
                  maxLength={MESSAGE_MAX}
                  readOnly={sending}
                  aria-invalid={!!errors.message}
                  aria-describedby={describedBy('message', `${id('message')}-count`)}
                  onBlur={() => onBlur('message')}
                  onChange={(e) => setMessageLength(e.target.value.length)}
                  className={cx(inputClass, 'min-h-[9rem] resize-y')}
                />
                <div className="mt-1.5 flex items-start justify-between gap-4">
                  {errors.message ? (
                    <p id={`${id('message')}-error`} className="text-sm text-danger">
                      {errors.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    id={`${id('message')}-count`}
                    className={cx(
                      'shrink-0 font-mono text-xs',
                      messageLength > MESSAGE_MAX * 0.9 ? 'text-warning' : 'text-ink-3',
                    )}
                  >
                    {messageLength}/{MESSAGE_MAX}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
                <button type="submit" disabled={sending} className={btnPrimary}>
                  <Send size={16} aria-hidden="true" />
                  {sending ? 'Sending…' : 'Send message'}
                </button>
                {mailto && (
                  <a href={mailto} className={cx(btnSecondary, 'border-transparent px-2 hover:bg-transparent hover:underline')}>
                    Or email me
                  </a>
                )}
              </div>

              <div role="status" aria-live="polite" className="empty:hidden">
                {status.kind === 'sent' && (
                  <p className="flex items-start gap-2 rounded-control border border-success/30 bg-success/[0.07] px-4 py-3 text-ink">
                    <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
                    Message sent. Thanks, I'll reply by email.
                  </p>
                )}
              </div>
              {status.kind === 'error' && (
                <div role="alert" className="rounded-control border border-danger/40 bg-danger/[0.07] px-4 py-3 text-ink">
                  <p>{status.message}</p>
                  {mailto && (
                    <p className="mt-1 text-sm text-ink-2">
                      You can also email me at{' '}
                      <a href={mailto} className="font-medium text-ink underline underline-offset-4">
                        {contact.email}
                      </a>
                      .
                    </p>
                  )}
                </div>
              )}
            </form>
          )}
        </section>
      </div>
  );
}

