// Contact details. Sourced from lib/contact.json which is generated at build time
// from the admin's /api/public/sync endpoint. Falls back to placeholders if the
// JSON file is missing (e.g. very first build before the backend exists).
import contactJson from "./contact.json" with { type: "json" };

type ContactShape = {
  phoneDisplay: string;
  phoneTel: string;
  whatsApp: string;
  email: string;
  addressLine: string;
  businessHours: string;
};

const fallback: ContactShape = {
  phoneDisplay: "REPLACE_ME_PHONE_DISPLAY",
  phoneTel: "REPLACE_ME_PHONE_TEL",
  whatsApp: "REPLACE_ME_WHATSAPP",
  email: "REPLACE_ME_EMAIL@example.com",
  addressLine: "Bridgetown, Barbados",
  businessHours: "Daily, 6:00 AM – 10:00 PM",
};

const loaded = contactJson as Partial<ContactShape>;
export const CONTACT: ContactShape = {
  phoneDisplay: loaded.phoneDisplay || fallback.phoneDisplay,
  phoneTel: loaded.phoneTel || fallback.phoneTel,
  whatsApp: loaded.whatsApp || fallback.whatsApp,
  email: loaded.email || fallback.email,
  addressLine: loaded.addressLine || fallback.addressLine,
  businessHours: loaded.businessHours || fallback.businessHours,
};

export const waMessage = encodeURIComponent(
  "Hi Access Barbados, I'd like to ask about a ride.",
);
