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

/**
 * Gera a URL wa.me/ correta a partir de um número guardado (com ou sem DDI).
 * Suporta Brasil (+55) e Portugal (+351).
 */
export function buildWhatsAppUrl(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (!d) return WHATSAPP_LINK;
  // Já tem DDI completo
  if (d.startsWith("55") && d.length >= 12 && d.length <= 13) return `https://wa.me/${d}`;
  if (d.startsWith("351") && d.length === 12) return `https://wa.me/${d}`;
  // Sem DDI: inferir pelo padrão
  if (d.length === 9 && (d[0] === "9" || d[0] === "2")) return `https://wa.me/351${d}`; // PT
  if (d.length === 10 || d.length === 11) return `https://wa.me/55${d}`; // BR
  return `https://wa.me/${d}`;
}

/**
 * Formata um número armazenado (com DDI) para exibição amigável.
 * +351XXXXXXXXX → +351 XXX XXX XXX
 * +55XXXXXXXXXXX → +55 (XX) XXXXX-XXXX
 */
export function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  // Portugal: 351 + 9 dígitos
  if (d.startsWith("351") && d.length === 12) {
    const n = d.slice(3);
    return `+351 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  // Brasil: 55 + DDD(2) + número(8 ou 9)
  if (d.startsWith("55")) {
    const n = d.slice(2);
    if (n.length === 11) return `+55 (${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    if (n.length === 10) return `+55 (${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  }
  return phone;
}

// ── Design Tokens ──

export const ACCENT = "#C49A82";
export const ACCENT_LIGHT = "#F5EDE6";
export const BACKGROUND = "#FAF9F6";
export const PRIMARY = "#2B2723";
