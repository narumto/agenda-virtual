// ── Site Config (single source of truth) ──

export const siteConfig = {
  name: "Agenda Virtual",
  logoUrl:
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=150&h=150&q=80",
} as const;

// ── Alias para import legado ──
export const SITE_NAME = siteConfig.name;
export const LOGO_URL = siteConfig.logoUrl;

// ── WhatsApp ──

export const WHATSAPP_NUMERO = "+351 912 345 678";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMERO.replace(/\D/g, "")}`;

// ── Design Tokens ──

export const ACCENT = "#C49A82";
export const ACCENT_LIGHT = "#F5EDE6";
export const BACKGROUND = "#FAF9F6";
export const PRIMARY = "#2B2723";
