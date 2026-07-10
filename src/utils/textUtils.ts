export function exposeCommentedHtml(html: string): string {
  return html.replace(/<!--([\s\S]*?)-->/g, "$1");
}

export function cleanText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
