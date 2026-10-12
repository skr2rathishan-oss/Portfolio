# Portfolio

## Content editing: draft and publish

The site content is a JSON document in Netlify Blobs, edited at `/admin`. Visitors only ever see the **published** document. Everything in the admin (the visual editor and the list pages) edits a private **draft**.

| Blobs key (store `portfolio-content[-preview\|-dev]`) | Contents |
|---|---|
| `content` | Published document. `/api/content` reads only this key. |
| `draft` | The draft: `{ draftRev, baseRev, updatedAt, content }`. When the key doesn't exist, the published document is used as the draft (`draftRev` 0). |
| `revisions/*` | Snapshots written by every publish. The newest 30 are kept. |
| `draft-backups/*` | The previous draft, saved before a discard or a restore overwrites it. The newest 10 are kept. |

How the admin uses the draft:
- **Saving** writes the draft (`PUT /api/admin/draft`, `If-Match: "draft-N"`). It creates no revision, doesn't purge the CDN, and changes nothing for visitors.
- **Publish** (`POST /api/admin/publish`) copies the draft to `content`, records a revision, and purges the `content` CDN cache tag.
  - If someone published from elsewhere after the draft was started, the server answers `409 published_changed`, and the UI asks before publishing anyway (`force`).
- **Discard draft** (`POST /api/admin/draft/discard`) backs up the draft and resets it to the published content.
- **History**:
  - *Restore* loads a revision into the draft (`/restore-to-draft`). The live site isn't touched.
  - *Restore and publish* makes a revision live straight away and resets the draft to it. The old draft is backed up.
- `GET /api/admin/status` reports whether the draft has unpublished changes. This is computed by comparing the documents, never stored.
- Media counts as "In use" when either the published content or the draft references it. Uploads are never deleted automatically.

Every admin endpoint has the same protections:
- The session cookie is required.
- Mutations go through the CSRF check: same `Origin`, `Sec-Fetch-Site`, and `X-Admin-Request: 1`.
- `If-Match` is required on mutations: 428 when it's missing, 412 when it's stale.
- Bodies are size-limited (413), and documents are validated with zod (400 with issue paths).

The legacy `PUT /api/admin/content` (direct publish) still works, but the admin UI doesn't use it.

Local development: `npx netlify-cli dev` runs the functions and the local Blobs store. Plain `vite` serves the built-in seed content only.
