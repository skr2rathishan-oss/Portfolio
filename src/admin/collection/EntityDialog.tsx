// Add / edit modal for one collection item, with a live preview of the real card.
import { useMemo, useState } from 'react';
import type { Technology } from '../../content/types';
import { newId } from '../lib/ids';
import { nextOrder, upsertItem, type CollectionKey, type ItemOf } from '../lib/reducers';
import { stripEmptyOptional, validateItem, type FieldErrors } from '../lib/validate';
import { useAdminContent, useDoc } from '../state/AdminContentContext';
import { Button, ConfirmDialog, Modal } from '../ui/primitives';
import type { EntityConfig, FormExtras } from './types';

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function EntityDialog<K extends CollectionKey>({
  config,
  initial,
  isNew,
  onClose,
  onSaved,
}: {
  config: EntityConfig<K>;
  initial: ItemOf<K>;
  isNew: boolean;
  onClose: () => void;
  /** Called with the saved item (final id and order) before the dialog closes. */
  onSaved?: (item: ItemOf<K>) => void;
}) {
  const doc = useDoc();
  const { mutate } = useAdminContent();
  const [draft, setDraft] = useState<ItemOf<K>>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [newTechnologies, setNewTechnologies] = useState<Technology[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const previewDoc = useMemo(
    () => (newTechnologies.length ? { ...doc, technologies: [...doc.technologies, ...newTechnologies] } : doc),
    [doc, newTechnologies],
  );

  const extras: FormExtras = {
    newTechnologies,
    createTechnology: (name) => {
      const category =
        [...doc.techCategories].filter((c) => c.visible).sort((a, b) => a.order - b.order)[0] ?? doc.techCategories[0];
      const tech: Technology = {
        id: newId('tec', name),
        order: nextOrder([...doc.technologies, ...newTechnologies]),
        visible: true,
        name: name.slice(0, 60),
        categoryId: category?.id ?? '',
        proficiency: 'familiar',
        showInStack: true,
        featured: false,
      };
      setNewTechnologies((list) => [...list, tech]);
      return tech.id;
    },
  };

  const update = (patch: Partial<ItemOf<K>>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
    const keys = Object.keys(patch);
    setErrors((e) => {
      if (!keys.some((k) => Object.keys(e).some((ek) => ek === k || ek.startsWith(`${k}.`)))) return e;
      const next = { ...e };
      for (const ek of Object.keys(next)) if (keys.some((k) => ek === k || ek.startsWith(`${k}.`))) delete next[ek];
      return next;
    });
  };
  const set = <F extends keyof ItemOf<K>>(field: F, value: ItemOf<K>[F]) => update({ [field]: value } as unknown as Partial<ItemOf<K>>);

  const requestClose = () => {
    if (dirty && !saving) setConfirmDiscard(true);
    else onClose();
  };

  const save = async () => {
    setFormError(null);
    // New items get their real id before validation (blank() starts with id '', which the schema rejects).
    const candidate = isNew
      ? ({ ...draft, id: newId(config.idPrefix, String((draft as unknown as Record<string, unknown>)[config.titleField] ?? '')) } as ItemOf<K>)
      : draft;
    const checked = validateItem(config.schema, candidate);
    if (!checked.ok) {
      setErrors(checked.errors);
      setFormError('Fix the highlighted fields.');
      return;
    }
    let item = checked.data as ItemOf<K>;
    if (isNew) {
      item = { ...item, order: nextOrder(doc[config.key] as { order: number }[]) };
    }
    const techs = newTechnologies.filter((t) =>
      JSON.stringify(item).includes(`"${t.id}"`),
    );
    setSaving(true);
    const res = await mutate(
      (d) => upsertItem(config.key, item)(techs.length ? { ...d, technologies: [...d.technologies, ...techs] } : d),
      { success: `${capitalize(config.singular)} ${isNew ? 'added' : 'saved'}`, quietValidation: true },
    );
    setSaving(false);
    if (res.ok) {
      onSaved?.(item);
      onClose();
      return;
    }
    if (res.issues) {
      // Map document paths ("projects.3.title") back to form fields ("title").
      const own = new RegExp(`^${config.key}\\.\\d+\\.`);
      const mapped: FieldErrors = {};
      for (const issue of res.issues) {
        const path = own.test(issue.path) ? issue.path.replace(own, '') : issue.path;
        if (!(path in mapped)) mapped[path] = issue.message;
      }
      setErrors(mapped);
    }
    setFormError(res.message);
  };

  const Form = config.Form;
  const Preview = config.Preview;
  const previewItem = useMemo(
    () => stripEmptyOptional(draft as unknown as Record<string, unknown>, config.schema) as unknown as ItemOf<K>,
    [draft, config.schema],
  );
  const title = String((draft as unknown as Record<string, unknown>)[config.titleField] ?? '') || `Untitled ${config.singular}`;

  return (
    <>
      <Modal
        title={isNew ? `Add ${config.singular}` : `Edit ${config.singular}`}
        description={isNew ? undefined : title}
        onClose={requestClose}
        size="lg"
        aside={
          <div>
            <p className="mb-3 text-xs font-medium text-[#7f97ad]">Preview</p>
            <div className="pointer-events-none" inert>
              <Preview item={previewItem} doc={previewDoc} />
            </div>
          </div>
        }
        footer={
          <>
            {formError && (
              <p role="alert" className="mr-auto text-sm text-[#ff8a8a]">
                {formError}
              </p>
            )}
            <Button variant="ghost" onClick={requestClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void save()} busy={saving}>
              {isNew ? `Add ${config.singular}` : 'Save changes'}
            </Button>
          </>
        }
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="space-y-5"
        >
          <Form value={draft} set={set} update={update} errors={errors} doc={previewDoc} extras={extras} isNew={isNew} />
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>
      {confirmDiscard && (
        <ConfirmDialog
          title="Discard changes?"
          message="Your edits to this item have not been saved."
          confirmLabel="Discard"
          onCancel={() => setConfirmDiscard(false)}
          onConfirm={() => {
            setConfirmDiscard(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
