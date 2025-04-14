
export class PageState {
  selectedWord = $state<string | null>(null);
  wordDefinition = $state<string | null>(null);
  iframeLoading = $state(true);
  onePanel = $state(true);
}
