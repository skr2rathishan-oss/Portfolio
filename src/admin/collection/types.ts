import type { ComponentType, ReactNode } from 'react';
import type { z } from 'zod';
import type { Content, ID, Technology } from '../../content/types';
import type { CollectionKey, ItemOf } from '../lib/reducers';
import type { FieldErrors } from '../lib/validate';

export interface FormExtras {
  /** Technologies created inline in this form (added to the document on save). */
  newTechnologies: Technology[];
  createTechnology: (name: string) => ID;
}

export interface FormProps<T> {
  value: T;
  set: <F extends keyof T>(field: F, value: T[F]) => void;
  update: (patch: Partial<T>) => void;
  errors: FieldErrors;
  doc: Content;
  extras: FormExtras;
  isNew: boolean;
  /** Rendered inside the visual editor's properties panel (no autofocus). */
  embedded?: boolean;
}

export interface EntityConfig<K extends CollectionKey> {
  key: K;
  /** Lowercase singular noun shown in UI copy ("project"). */
  singular: string;
  idPrefix: string;
  schema: z.ZodObject;
  blank: (doc: Content) => ItemOf<K>;
  title: (item: ItemOf<K>) => string;
  /** Renders the public card for an item. */
  Preview: ComponentType<{ item: ItemOf<K>; doc: Content }>;
  Form: ComponentType<FormProps<ItemOf<K>>>;
  /** Field holding the display title, used when duplicating ("… (copy)"). */
  titleField: keyof ItemOf<K> & string;
  isFeatured?: (item: ItemOf<K>) => boolean;
  badges?: (item: ItemOf<K>, doc: Content) => ReactNode;
  dialogSize?: 'md' | 'lg';
  /** Returns a reason when the item cannot be deleted yet. */
  deleteBlocker?: (item: ItemOf<K>, doc: Content) => string | null;
}
