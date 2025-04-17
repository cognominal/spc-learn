import { PageState } from '$lib/PageState.svelte.js';
import { cleanProcessedHtml } from '$lib';

export function handleClickRussianWord(event: MouseEvent | KeyboardEvent, pageState: PageState): boolean {

    const target = event.target as HTMLElement;
    if (target.getAttribute("data-lang") !== "ru") return false;

    const word = target.getAttribute("data-word");
    if (word) {
        if (pageState.selectedElement)
            pageState.selectedElement.style.removeProperty('color');
        pageState.selectedElement = target;
        getAndProcessDefinition(word, pageState);
    }
    return true;
}

//  A language section is a russian sentence and its translation.
// When clicking a section but not a russian word, we grey out all the other sections and hide their translation

export function handleClickSection(event: MouseEvent | KeyboardEvent, pageState: PageState): boolean {
    let target = event.target as HTMLElement;
    if (target.hasAttribute('data-word')) {
        target = target.parentElement!;
    }

    if (target.classList.contains('break-words')) {
        document.querySelectorAll('li.break-words').forEach(li => {

            if (li === target) {
                // For the target li, remove color property and set display to inline for all child elements except strong
                li.querySelectorAll('*').forEach(element => {
                    if (pageState.selectedElement === element) {
                        (element as HTMLElement).style.color = '#EE0000';
                    } else {
                        (element as HTMLElement).style.removeProperty('color');
                    }
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
    handleClickRussianWord(event, pageState);
    if (handleClickSection(event, pageState)) return;

}
async function getDefinition(word: string): Promise<string> {
    const form = new FormData();
    form.append("word", word);

    try {
        const response: Response = await fetch("?/getDefinition", {
            method: "POST",
            body: form,
        });
        const result: { data: string } = await response.json();
        const parsed = JSON.parse(result.data);
        // why parsed has this form
        // [
        //     {
        //         "word": 1,
        //         "indices": 2,
        //         "processedWiktionaryPage": 3
        //     },
        //     "это",
        //     [],
        //     "<!DOCTYPE ..."
        // ]


        let defn = parsed[3];
        return defn

    } catch (error) { return "WTF" }
}

async function getAndProcessDefinition(word: string, pageState: PageState) {
    try {
        pageState.selectedWord = word;
        pageState.iframeLoading = true;
        getDefinition(word).then((defn) => {
            if (defn) {
                pageState.wordDefinition = defn;
            } else {
                pageState.wordDefinition = "<div class='p-4 text-center text-red-600'>Definition not found</div>";
            }
        })
    } catch (error) {
        console.error("Error fetching definition:", error);
        pageState.wordDefinition = "<div class='p-4 text-center text-red-600'>Error loading definition</div>";
    }

}
