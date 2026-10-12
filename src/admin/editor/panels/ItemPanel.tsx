// Properties for a collection item (project, skill, certificate, ...): the list editors' own form,
// committed field-by-field to the shared draft.
import { useMemo, useState } from 'react';
import { ITEM_STYLE_SUPPORT, type StyledCollection } from '../../../content/styleClasses';
import type { CollectionName, Content, Technology } from '../../../content/types';
import type { FormExtras } from '../../collection/types';
import { newId } from '../../lib/ids';
import { setItemStyle } from '../../lib/layoutReducers';
import { nextOrder, patchItem, type CollectionKey } from '../../lib/reducers';
import { validateItem } from '../../lib/validate';
import { configFor } from '../entityConfigs';
import { useEditor } from '../state/EditorContext';
import { StyleControls } from '../StyleControls';
import { findItem, itemOrderNote } from '../targets';
import { changedKeys, useDraft } from './useDraft';

type AnyItem = Record<string, unknown> & { id: string };

export function ItemContent({ coll, id }: { coll: CollectionName; id: string }) {
  const { doc } = useEditor();
  const item = findItem(doc, coll, id);
  if (!item) return <p className="text-sm text-[#8ea6bd]">This item no longer exists.</p>;
  return <ItemForm key={`${coll}:${id}`} coll={coll} item={item as unknown as AnyItem} doc={doc} />;
}

function ItemForm({ coll, item, doc }: { coll: CollectionName; item: AnyItem; doc: Content }) {
  const { apply, page } = useEditor();
  const config = configFor(coll);
  const [newTechnologies, setNewTechnologies] = useState<Technology[]>([]);
  const target = `item:${coll}:${item.id}`;

  const d = useDraft<AnyItem>({
    id: `panel:${target}`,
    source: item,
    validate: (v) => {
      const r = validateItem(config.schema, v);
      return r.ok ? { ok: true, data: r.data as AnyItem } : r;
    },
    commit: (data, base) => {
      const patch = changedKeys(base, data, ['id', 'order', 'style']);
      const json = JSON.stringify(patch);
      const techs = newTechnologies.filter((t) => json.includes(`"${t.id}"`));
      return apply(
        (cur) => {
          const withTech = techs.length ? { ...cur, technologies: [...cur.technologies, ...techs.filter((t) => !cur.technologies.some((x) => x.id === t.id))] } : cur;
          return patchItem(coll as CollectionKey, item.id, patch as never)(withTech);
        },
        { coalesceKey: `panel:${target}`, quiet: true },
      );
    },
  });

  const previewDoc = useMemo(
    () => (newTechnologies.length ? { ...doc, technologies: [...doc.technologies, ...newTechnologies] } : doc),
    [doc, newTechnologies],
  );
  const extras: FormExtras = {
    newTechnologies,
    createTechnology: (name) => {
      const category = [...doc.techCategories].filter((c) => c.visible).sort((a, b) => a.order - b.order)[0] ?? doc.techCategories[0];
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

  const Form = config.Form;
  const note = itemOrderNote(doc, page, coll);
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void d.commitNow();
      }}
      onBlur={d.onBlur}
      className="space-y-5"
    >
      {note && <p className="rounded-lg border border-[#1b3550] bg-[#0a1a2b] px-3 py-2 text-xs text-[#8ea6bd]">Order: {note}</p>}
      <Form value={d.draft as never} set={d.set as never} update={d.update as never} errors={d.errors} doc={previewDoc} extras={extras} isNew={false} embedded />
    </form>
  );
}

export function ItemStyle({ coll, id }: { coll: CollectionName; id: string }) {
  const { doc, apply } = useEditor();
  const item = findItem(doc, coll, id) as { style?: Record<string, string> } | undefined;
  const keys = ITEM_STYLE_SUPPORT[coll as StyledCollection] ?? [];
  return (
    <StyleControls
      keys={keys}
      style={item?.style}
      empty="This kind of item has no style options."
      onChange={(key, value) => void apply(setItemStyle(coll, id, key, value), { coalesceKey: `style:item:${coll}:${id}` })}
    />
  );
}
