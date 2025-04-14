
export class PageState {
  selectedWord = $state<string | null>(null);
  selectedElement = $state<HTMLElement | null>(null);
  wordDefinition = $state<string | null>(null);
  iframeLoading = $state(true);
  onePanel = $state(true);
}
