// Shared publish-side helpers: CDN purge (only ever called from publish paths) and keeping the
// draft in step after a publish.
import { purgeCache } from '@netlify/functions';
import type { Content } from '../../src/content/types';
import { backupDraft, loadDraft, writeDraft } from './draft';
import { deployContextKind, type BlobStore, type FnContext } from './stores';

/** Purges the public `/api/content` CDN entry (tag "content"). Skipped under `netlify dev`. */
export async function purgePublicCache(context: FnContext): Promise<void> {
  if (deployContextKind(context) === 'dev') return;
  try {
    await purgeCache({ tags: ['content'] });
  } catch (err) {
    // The CDN entry still revalidates within max-age; log and continue.
    console.error('[publish] cache purge failed', err);
  }
}

/**
 * After "Restore & publish now": backs the draft up, then makes it equal to what was just
 * published (baseRev = the new published rev). Best effort: one retry on a lost race, then logs.
 */
export async function resetDraftAfterPublish(store: BlobStore, content: Content, publishedRev: number): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const current = await loadDraft(store);
      // No draft key: the virtual draft already mirrors the published document.
      if (current.source !== 'draft') return;
      await backupDraft(store, current);
      await writeDraft(store, current, current.draft.draftRev, { content, baseRev: publishedRev });
      return;
    } catch (err) {
      if (attempt === 1) console.error('[publish] could not reset the draft after publishing', err);
    }
  }
}
