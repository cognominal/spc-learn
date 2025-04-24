// Clean function for processed HTML
export function cleanProcessedHtml(raw: string) {
  let html = raw;
  // Try to parse if it's a JSON string
  if (typeof html === "string" && html.startsWith('"') && html.endsWith('"')) {
    try {
      html = JSON.parse(html);
    } catch { }
  }
  // Decode HTML entities
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export function validUrl(url: string): URL | false {
  try { return new URL(url) } catch { return false }
}

export function isValidSelector(selector: string): boolean {

  if (!selector.trim()) return true // Allow empty for new fields
  try {
    // valid selector ?
    document.createDocumentFragment().querySelector(selector)
    return true
  } catch {
    return false
  }
}


export function getNonTailwindClasses(doc: Document): Set<string> {
  // Regex for common Tailwind class prefixes (expand as needed)
  const tailwindPattern = /^(bg-|text-|p[trblxy]?-[0-9a-z]+|m[trblxy]?-[0-9a-z]+|flex|grid|rounded|shadow|border|w-|h-|min-|max-|items-|justify-|gap-|space-|font-|leading-|tracking-|overflow-|z-|top-|bottom-|left-|right-|object-|transition|duration-|ease-|opacity-|scale-|translate-|rotate-|skew-|cursor-|select-|pointer-events-|align-|place-|inset-|divide-|ring-|outline-|appearance-|resize|list-|order-|col-|row-|auto|block|inline|hidden)$/;

  const allClasses = new Set<string>();
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);

  let node = walker.currentNode as Element;
  while (node) {
    if (node.classList) {
      for (const cls of node.classList) {
        if (!tailwindPattern.test(cls)) {
          allClasses.add(cls);
        }
      }
    }
    node = walker.nextNode() as Element;
  }
  return allClasses;
}


export function countSelectorMatches(doc: Document, selector: string): number {

  if (selector.trim() === "") return 0; // No selector
  console.log(`doc: ${doc} countSelectorMatches: ${selector}`);
  try {
    const matches = doc.querySelectorAll(selector).length;

    return matches;
  } catch {
    // If the selector is invalid, return 0
    return 0;
  }
}


export function isAbsoluteUrl(url: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}
