# Access Barbados

Wheelchair-accessible transportation across Barbados. Marketing site for the service.

**Live preview:** https://kkhinds.github.io/access-barbados/

## Tech

- Next.js 15 (static export)
- TypeScript
- Tailwind CSS
- Deployed to GitHub Pages via GitHub Actions

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Building the static export locally

```bash
GITHUB_PAGES=true npm run build
```

Output goes to `out/`. The `GITHUB_PAGES=true` env var sets the `basePath` to `/access-barbados` so asset URLs match the Pages deployment path. Omit it for a root-path build (useful for serving from a custom domain).

## Replacing the placeholders before launch

- `lib/contact.ts` — phone number, WhatsApp number, email address (search for `REPLACE_ME`)
- The forms currently open the visitor's email client (mailto). For real inbox delivery, swap the `mailto` build in `components/BookingForm.tsx` and `components/Contact.tsx` for a Formspree or Resend integration.
