import { JSDOM } from 'jsdom';

export function handleRussian(doc: Document, html: string): string | null {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Remove logo container and edit sections
    const logoContainer = tempDiv.querySelector(".mw-logo-container");
    logoContainer?.remove();
    
    // Remove all edit sections
    tempDiv.querySelectorAll(".mw-editsection").forEach(el => el.remove());

    // Find Russian section in the fetched content
    const russianSection = tempDiv.querySelector("#Russian");
    if (!russianSection) return null;

    const content = document.createElement("div");
    content.id = "Russian-content";

    // Add the Russian heading
    const heading = russianSection.parentElement;
    if (heading) content.appendChild(heading.cloneNode(true));

    // Add all content until next h2
    let currentElement = heading?.nextElementSibling;
    while (currentElement && currentElement.tagName !== "H2") {
        content.appendChild(currentElement.cloneNode(true));
        currentElement = currentElement.nextElementSibling;
    }

    return content.outerHTML;
}
