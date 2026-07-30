// ── Site Config (single source of truth) ──

export const siteConfig = {
  name: "Cristiane Vasconcelos Clinic",
  logoUrl: "/logo.png",
} as const;

// ── Alias para import legado ──
export const SITE_NAME = siteConfig.name;
export const LOGO_URL = siteConfig.logoUrl;

export const WHATSAPP_NUMERO = "+351 912 345 678";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMERO.replace(/\D/g, "")}`;

// ── Design Tokens ──

export const ACCENT = "var(--accent)";
export const ACCENT_LIGHT = "var(--accent-light)";
export const BACKGROUND = "var(--background)";
export const PRIMARY = "var(--primary)";
export const SIDEBAR_BG = "var(--sidebar-bg)";
export const SIDEBAR_TEXT = "var(--sidebar-text)";
export const SIDEBAR_ACTIVE_BG = "var(--sidebar-active-bg)";
