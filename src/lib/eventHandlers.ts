// state.ts
export class PageState {
    selectedWord: string | null;
    wordDefinition: string | null;
    iframeLoading: boolean;

    constructor(selectedWord: string | null = null, wordDefinition: string | null = null, iframeLoading: boolean = true) {
        this.selectedWord = selectedWord;
        this.wordDefinition = wordDefinition;
        this.iframeLoading = iframeLoading;
    }

    // Optional: Methods to update state
    setSelectedWord(word: string | null) {
        this.selectedWord = word;
    }

    setWordDefinition(definition: string | null) {
        this.wordDefinition = definition;
    }

    setIframeLoading(loading: boolean) {
        this.iframeLoading = loading;
    }
}



export function handleClickRussianWord(event: MouseEvent | KeyboardEvent, pageState: PageState): boolean {
    const target = event.target as HTMLElement;
    if (!target.classList.contains("russian-word")) return false;
    const word = target.getAttribute("data-word");
    if (word) {
        showDefinition(word, pageState);
    }
    return true;
}

function hideEnglish() {
    document.querySelectorAll('li.break-words strong').forEach(li => {
        
        (li as HTMLElement).style.color = '#9ca3af'; // grey color
        const english = li.querySelector('strong:contains("English:")');
        if (english?.parentElement) {
            english.parentElement.style.display = 'none';
        }
    });
}

export function handleClick(event: MouseEvent | KeyboardEvent, pageState: PageState) {
    if (handleClickRussianWord(event, pageState)) return;

    // Reset all li elements to default state
    document.querySelectorAll('li.break-words').forEach(li => {
        (li as HTMLElement).style.color = '#9ca3af'; // grey color
        const english = li.querySelector('strong:contains("English:")');
        if (english?.parentElement) {
            english.parentElement.style.display = 'none';
        }
    });

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
        pageState.wordDefinition = result.data;

        if (pageState.wordDefinition) {
            pageState.wordDefinition = pageState.wordDefinition.replace(/\\u003C/g, "<");
            pageState.wordDefinition = pageState.wordDefinition.replace(/\\n/g, "");
        } else {
            pageState.wordDefinition = "Definition not found";
        }
    } catch (error) {
        console.error("Error fetching definition:", error);
        pageState.wordDefinition = "Error loading definition";
    }
}
