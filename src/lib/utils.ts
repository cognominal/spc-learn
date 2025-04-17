// Clean function for processed HTML
export function cleanProcessedHtml(raw: string) {
    let html = raw;
    // Try to parse if it's a JSON string
    if (typeof html === "string" && html.startsWith('"') && html.endsWith('"')) {
      try {
        html = JSON.parse(html);
      } catch {}
    }
    // Decode HTML entities
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
  