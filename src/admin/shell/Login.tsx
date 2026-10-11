import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import * as api from '../api';
import { inputClass } from '../fields/Field';
import { Button, cx, IconButton, Modal } from '../ui/primitives';

function PasswordForm({ onSuccess, autoFocus = true, submitLabel = 'Sign in' }: { onSuccess: () => void; autoFocus?: boolean; submitLabel?: string }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.login(password);
      setPassword('');
      onSuccess();
    } catch (err) {
      const e2 = err as api.ApiError;
      setError(
        e2.status === 401
          ? 'That password is not correct.'
          : e2.status === 429
            ? 'Too many attempts. Wait a few minutes and try again.'
            : e2.message,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-[13px] font-medium text-[#cfdbe6]">
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            autoFocus={autoFocus}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? 'admin-password-error' : undefined}
            className={cx(inputClass, 'h-11 pr-11')}
          />
          <IconButton
            label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
            className="absolute right-1.5 top-1.5"
          >
            {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </IconButton>
        </div>
        {error && (
          <p id="admin-password-error" role="alert" className="mt-2 text-sm text-[#ff8a8a]">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" variant="primary" busy={busy} className="w-full h-11">
        {submitLabel}
      </Button>
    </form>
  );
}

export function LoginPage({ onSuccess, notConfigured, apiError }: { onSuccess: () => void; notConfigured?: boolean; apiError?: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06111d] px-4 py-12 text-[#e8f0f7] [background-image:radial-gradient(ellipse_at_top,rgba(0,171,240,0.10),transparent_60%)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00abf0]/12 text-[#00abf0]">
            <KeyRound size={20} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-white">Portfolio admin</h1>
            <p className="text-sm text-[#8ea6bd]">Sign in to edit your site.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#1b3550] bg-[#0b1c2e] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          {apiError ? (
            <p role="alert" className="text-sm leading-relaxed text-[#f5c46a]">
              {apiError}
            </p>
          ) : notConfigured ? (
            <div className="space-y-2 text-sm leading-relaxed text-[#b8c9d9]">
              <p className="font-medium text-[#f5c46a]">Admin login is not set up yet.</p>
              <p>
                Run <code className="rounded bg-white/10 px-1">node scripts/hash-password.mjs --secret</code> and add{' '}
                <code className="rounded bg-white/10 px-1">ADMIN_PASSWORD_HASH</code> and{' '}
                <code className="rounded bg-white/10 px-1">ADMIN_SESSION_SECRET</code> to the site’s environment variables,
                then redeploy.
              </p>
            </div>
          ) : (
            <PasswordForm onSuccess={onSuccess} />
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <a href="/" className="text-[#8ea6bd] hover:text-white underline-offset-4 hover:underline">
            Back to the site
          </a>
        </p>
      </div>
    </main>
  );
}

/** Shown when the session expires mid-edit; open forms stay intact behind it. */
export function ReloginDialog({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  return (
    <Modal title="Session expired" description="Sign in again to finish saving. Your edits are kept." onClose={onCancel} size="sm">
      <PasswordForm onSuccess={onSuccess} submitLabel="Sign in and continue" />
    </Modal>
  );
}
