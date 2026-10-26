# Portfolio

## Content

All site content lives in `src/content/seed.json` and is bundled with the site. To change the site, edit that file and redeploy.

Run `npm run check:content` after editing to validate the document against the schema and check that every local asset it references exists in `public/`.

## Development

- `npm run dev` starts the Vite dev server.
- `npm run build` builds the static site into `dist/` (deployed to Netlify).
- `npm run lint` type-checks the project.
