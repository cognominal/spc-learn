
// the selection of a `word` in the document will trigger the search
// of the `wordDefinition` in the database or fetch it from the 
// Wiktionary, according to the `lang`. The selected word is in the
// `selectedElement` that is set in red.
// The close button in the WiktDefinition component will set the 
// will close the said component.

export class PageState {
  selectedWord = $state<string | null>(null);
  selectedElement = $state<HTMLElement | null>(null);
  wordDefinition = $state<string | null>(null);
  iframeLoading = $state(true);
  onePanel = $state(true);
  lang = $state<string>('en')
}
