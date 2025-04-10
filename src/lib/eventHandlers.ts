// Define the PageState interface
export interface PageState {
    selectedWord: string | null;
    wordDefinition: string | null;
    iframeLoading: boolean;
    onePanel: boolean;
}

export function handleClickRussianWord(event: MouseEvent | KeyboardEvent, pageState: PageState): boolean {
    console.log('click russian word?');

    const target = event.target as HTMLElement;
    if (target.getAttribute("data-lang") !== "ru") return false;

    const word = target.getAttribute("data-word");
    if (word) {
        console.log('got word');

        showDefinition(word, pageState);
    }
    return true;
}

//  A section is a russian sentence and its translation.
// When clicking a section but not a russian word, we grey out all the other sections and hide their translation

export function handleClickSection(event: MouseEvent | KeyboardEvent, pageState: PageState): boolean {
    // Reset all li elements to default state
    const target = event.target as HTMLElement;
    console.log(target);
    if (target.classList.contains('break-words')) {
        document.querySelectorAll('li.break-words').forEach(li => {

            if (li === target) {
                // For the target li, remove color property and set display to inline for all child elements except strong
                li.querySelectorAll('*').forEach(element => {
                    (element as HTMLElement).style.removeProperty('color');
                    // Set display to inline for all elements except strong
                    if (element.tagName.toLowerCase() !== 'strong') {
                        (element as HTMLElement).style.display = 'inline';
                    }
                });

                // Add a solid black border to the target li
                (li as HTMLElement).style.border = '1px solid black';
                // Remove any filter for the target li
                (li as HTMLElement).style.removeProperty('filter');
            } else {
                // Set non-target li's to grey and remove any border
                (li as HTMLElement).style.color = '#9ca3af'; // grey color
                (li as HTMLElement).style.border = 'none'; // remove border
                // Set filter to 30% opacity for non-target li's
                (li as HTMLElement).style.filter = 'opacity(65%)';

                // Find all strong elements within this li
                li.querySelectorAll('strong').forEach(strong => {
                    strong.style.display = 'none'
                    // Check if the strong element contains the text "English:"
                    if (strong.textContent && strong.textContent.trim() === 'English:') {
                        // Hide all next siblings of the strong element
                        let nextSibling = strong.nextElementSibling;
                        while (nextSibling) {
                            (nextSibling as HTMLElement).style.display = 'none';
                            nextSibling = nextSibling.nextElementSibling;
                        }
                    }
                });
            }
        });
    }

    return true;
}


export function handleClick(event: MouseEvent | KeyboardEvent, pageState: PageState) {
    if (handleClickRussianWord(event, pageState)) return;
    if (handleClickSection(event, pageState)) return;

}

async function showDefinition(word: string, pageState: PageState) {
    pageState.selectedWord = word;
    pageState.iframeLoading = true;
    const form = new FormData();
    form.append("word", word);

    try {
        const response = await fetch("?/getDefinition", {
            method: "POST",
            body: form,
        });
        const result = await response.json();
        console.log(result);
        let rawDefinition = result.data;

        if (rawDefinition) {
            // Clean up the raw definition
            rawDefinition = rawDefinition.replace(/\\u003C/g, "<");
            rawDefinition = rawDefinition.replace(/\\n/g, "");

            // Remove any JSON artifacts that might be present
            // First, log the first 50 characters to see exactly what we're dealing with
            console.log(`First 50 chars of definition: '${rawDefinition.substring(0, 50)}'`);

            // Try different approaches to remove the artifacts
            // 1. Remove common JSON prefix patterns
            rawDefinition = rawDefinition.replace(/^\[\{"definition":1\},"/, "");
            rawDefinition = rawDefinition.replace(/^\[\{"definition":\d+\},"/, "");
            rawDefinition = rawDefinition.replace(/^\[\{"?definition"?:?\d*\}?,?"?/, "");

            // 2. Remove any remaining JSON-like prefix
            rawDefinition = rawDefinition.replace(/^[\[\{].*?[\}\]],?"?/, "");

            // 3. Remove trailing JSON artifacts
            rawDefinition = rawDefinition.replace(/"?\]?$/, "");

            // Log the first 50 characters after cleaning to verify
            console.log(`After cleaning, first 50 chars: '${rawDefinition.substring(0, 50)}'`);

            // Log information about the received definition
            console.log(`Client received definition length: ${rawDefinition.length}`);
            console.log(`Client received definition contains details tags: ${rawDefinition.includes('<details')}`);

            // Set the word definition in the page state
            pageState.wordDefinition = rawDefinition;
        } else {
            pageState.wordDefinition = "<div class='p-4 text-center text-red-600'>Definition not found</div>";
        }
    } catch (error) {
        console.error("Error fetching definition:", error);
        pageState.wordDefinition = "<div class='p-4 text-center text-red-600'>Error loading definition</div>";
    }
}
