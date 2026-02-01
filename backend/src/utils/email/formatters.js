export function formatRecipientsForLog(to) {
  if (!to) {
    return "";
  }

  if (Array.isArray(to)) {
    return to
      .map((x) => (typeof x === "string" ? x : x?.email || ""))
      .filter(Boolean)
      .join(",");
  }

  return typeof to === "string" ? to : to?.email || "";
}

export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function p(text) {
  return `<p style="margin:0 0 12px 0;line-height:1.45;">${text}</p>`;
}

export function a(href, label) {
  const safeHref = esc(href);
  const safeLabel = esc(label ?? href);
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
}

export function bulletList(items = []) {
  const safeItems = items
    .filter(Boolean)
    .map((it) => `<li style="margin:0 0 6px 0;">${it}</li>`)
    .join("");
  if (!safeItems) return "";
  return `<ul style="margin:0 0 12px 18px;padding:0;">${safeItems}</ul>`;
}

export function button(href, label) {
  const safeHref = esc(href);
  const safeLabel = esc(label);

  return `
    <div style="margin:16px 0 18px 0;">
      <a href="${safeHref}"
         target="_blank"
         rel="noopener noreferrer"
         style="
           display:inline-block;
           padding:12px 16px;
           text-decoration:none;
           border-radius:10px;
           font-weight:700;
           background:#111827;
           color:#ffffff;
         ">
        ${safeLabel}
      </a>
    </div>
  `.trim();
}

export function small(text) {
  return `<p style="margin:0 0 12px 0;line-height:1.45;color:#6b7280;font-size:12px;">${text}</p>`;
}

export function badge(text) {
  return `
    <span style="
      display:inline-block;
      padding:4px 10px;
      border-radius:999px;
      font-size:12px;
      font-weight:700;
      background:#f3f4f6;
      color:#111827;
    ">
      ${esc(text)}
    </span>
  `.trim();
}

export function emailLayout({ greetingName, title, bodyHtml, footerHtml }) {
  const name = esc(greetingName || "there");
  const safeTitle = esc(title);

  return `
  <div style="background:#f6f7fb;padding:24px 0;">
    <div style="max-width:640px;margin:0 auto;padding:0 16px;">
      
      <div style="padding:10px 4px 14px 4px;">
        <div style="font-size:14px;font-weight:800;letter-spacing:0.2px;color:#111827;">
          Episteme
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">
          Conference Submissions • Reviews • Editorial workflow
        </div>
      </div>

      <div style="
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:14px;
        padding:18px 18px 8px 18px;
        box-shadow:0 2px 10px rgba(0,0,0,0.04);
      ">
        ${p(`Hi ${name},`)}
        <div style="font-size:18px;font-weight:800;color:#111827;margin:2px 0 12px 0;">
          ${safeTitle}
        </div>

        ${bodyHtml || ""}

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0 12px 0;" />
        <div style="color:#6b7280;font-size:12px;line-height:1.45;">
          ${footerHtml || `— Episteme Team`}
        </div>
      </div>

      <div style="color:#9ca3af;font-size:11px;line-height:1.45;margin-top:10px;">
        You’re receiving this email because it relates to your Episteme account activity.
      </div>
    </div>
  </div>
  `.trim();
}
