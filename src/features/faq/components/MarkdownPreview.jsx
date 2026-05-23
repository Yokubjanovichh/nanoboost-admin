import { useMemo } from "react";
import styles from "./MarkdownPreview.module.css";

// Mirrors the public storefront mini-markdown so the answer admins type
// here renders the same way game.html will paint it. Three primitives
// only — paragraphs, **bold**, [text](url) — and every href runs through
// the safe-scheme gate so a typo can't smuggle in javascript: links.

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(raw) {
  const v = String(raw || "").trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^mailto:/i.test(v)) return v;
  if (/^\//.test(v)) return v;
  return "#";
}

function renderMiniMarkdown(src) {
  const safe = escapeHtml(src);
  const blocks = safe.split(/\n{2,}/);
  return blocks
    .map((block) => {
      let html = block.replace(/\n/g, "<br>");
      html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
        const href = escapeHtml(safeHref(url));
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      });
      return `<p>${html}</p>`;
    })
    .join("");
}

export function MarkdownPreview({ source, empty }) {
  const html = useMemo(() => renderMiniMarkdown(source || ""), [source]);
  if (!source || !source.trim()) {
    return <div className={styles.empty}>{empty}</div>;
  }
  return (
    <div
      className={styles.preview}
      // Source is escaped before token rewriting, so the only HTML in the
      // output is the small fixed set (<p>, <br>, <strong>, <a>) we emit.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
