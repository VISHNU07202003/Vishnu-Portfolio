# Vishnu Sai Padyala — Portfolio

React, TypeScript, Vite, Tailwind CSS and GSAP portfolio with a portrait-centered hero, one reversible three-chapter Experience stage, project case studies and an accessible local FAQ guide.

## Development

Use Node.js 24.x. From this directory:

```sh
npm ci
npm run dev
```

Vite runs at http://127.0.0.1:5173/. Run `npm test`, `npm run lint` and `npm run build` before release. The build includes TypeScript and source/output privacy checks. `npm run preview` serves the build and the same-origin GitHub endpoint locally.

## Production

Vercel project root is this directory, framework Vite, install `npm ci`, build `npm run build`, output `dist`. The `app` directory is the Vite application root, not the Vercel project root. Case-study routes use the scoped rewrite in `vercel.json`. The server-only function at `/api/github` requires no API key. A static-only host cannot provide that endpoint.

Read [deployment operations](DEPLOYMENT.md) before publishing. `publication-files.json` defines the proposed source-file list. Run `node scripts/publication-audit.mjs` and review actual staged paths before committing. Local reference/review material and generated outputs are excluded from publication. Do not add additional images or documents without approval and an updated asset audit.

Character and portrait artwork remain owner-supplied assets; no blanket license for their reuse is granted by this repository. No deployment is implied by preparing this source tree.
