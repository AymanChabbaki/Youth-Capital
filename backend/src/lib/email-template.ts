const SITE_URL = "https://www.youthcapital.org";
const LOGO_URL = `${SITE_URL}/email-logo.png`;
const NAVY = "#1B2A4A";
const GOLD = "#C9A84C";
const CREAM = "#F5F0E8";

const SOCIALS = [
  { label: "X / Twitter", href: "https://x.com/youthcapitalhq" },
  { label: "Instagram", href: "https://www.instagram.com/youthcapitalhq" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/youthcapitalhq" },
  { label: "Discord", href: "https://discord.gg/K87zstYzYE" },
];

const COPY = {
  en: {
    tagline: "Moroccan Youth Governance Simulation",
    signoff: "Best regards,",
    team: "The Youth Capital Team",
    footerNote: "You're receiving this because you're registered on Youth Capital.",
    rights: "All rights reserved.",
  },
  ar: {
    tagline: "محاكاة الحوكمة للشباب المغربي",
    signoff: "مع أطيب التحيات،",
    team: "فريق يوث كابيتال",
    footerNote: "تصلك هذه الرسالة لأنك مسجّل في منصة يوث كابيتال.",
    rights: "جميع الحقوق محفوظة.",
  },
};

/**
 * Wraps message HTML (plain <p> paragraphs) in a branded, table-based email
 * shell — table layout and inline styles throughout because that's what
 * actually renders consistently across email clients (Outlook in particular
 * ignores most modern CSS). Used by both the admin bulk-send tool and the
 * automatic application approve/reject notifications, so every email that
 * leaves the platform looks the same.
 */
export function wrapEmailHtml(bodyHtml: string, lang: "en" | "ar" = "en"): string {
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const align = isAr ? "right" : "left";
  const c = COPY[lang];
  const year = new Date().getFullYear();

  const socialLinks = SOCIALS
    .map((s) => `<a href="${s.href}" style="color:${GOLD};text-decoration:none;font-size:12px;font-weight:600;">${s.label}</a>`)
    .join(`<span style="color:#9aa3b2;font-size:12px;"> &nbsp;·&nbsp; </span>`);

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Youth Capital</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(27,42,74,0.08);">

        <!-- Header -->
        <tr>
          <td align="center" style="background-color:${NAVY};padding:32px 24px;">
            <img src="${LOGO_URL}" width="200" alt="Youth Capital" style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:200px;">
            <p style="margin:12px 0 0;color:${GOLD};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">${c.tagline}</p>
          </td>
        </tr>
        <tr><td style="height:3px;background-color:${GOLD};line-height:3px;font-size:0;">&nbsp;</td></tr>

        <!-- Body -->
        <tr>
          <td dir="${dir}" align="${align}" style="padding:40px 36px;color:#1f2937;font-size:15px;line-height:1.7;">
            ${bodyHtml}
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr>
                <td style="border-top:1px solid #e5e7eb;padding-top:20px;">
                  <p style="margin:0;color:#6b7280;font-size:14px;">${c.signoff}</p>
                  <p style="margin:4px 0 0;color:${NAVY};font-size:15px;font-weight:bold;">${c.team}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="background-color:${CREAM};padding:24px;">
            <p style="margin:0 0 10px;">${socialLinks}</p>
            <p style="margin:0 0 6px;color:#8a7a52;font-size:11px;">${c.footerNote}</p>
            <p style="margin:0;color:#8a7a52;font-size:11px;">© ${year} Youth Capital. ${c.rights}</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
