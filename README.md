# Access Barbados

Wheelchair-accessible transportation across Barbados. Marketing site for the service.

**Live:** https://accessbim.com

## Tech

- Next.js 15 (static export)
- TypeScript
- Tailwind CSS
- Deployed to GitHub Pages via GitHub Actions, custom domain `accessbim.com`

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Building the static export locally

```bash
npm run build
```

Output goes to `out/`. The build defaults to a root-path setup, which matches the live `accessbim.com` deployment. To rebuild for the legacy `kkhinds.github.io/access-barbados/` URL, run `BASE_PATH=/access-barbados npm run build` instead.

## Replacing the placeholders before launch

- `lib/contact.ts` — phone number, WhatsApp number, email address (search for `REPLACE_ME`)
- The forms currently open the visitor's email client (mailto). For real inbox delivery, swap the `mailto` build in `components/BookingForm.tsx` and `components/Contact.tsx` for a Formspree or Resend integration.
