# Subgoals

I got up to a relatively sane state with a lot of code produced
by augment which helps to develop from a semi real example, the
Soljenitzine's address. This list should help to go forward.

* cleaning

 [ ] words-dump.yaml should be done alphabetically for a smaller diff

* new routes/pages
  * [ ] a route for learning the grammars term so as to be able to read the wiktionary pages in the target language (now russian)
* [ ] a route for the 1000 more common words grouped by their non inflexion form. Need to find examples.
* [ ] an about page

* [ ] space repetition learning (the big item?)
* [x] a cleant up [raw-file-from-grok.html](static/raw-file-from-grok.html)
* general UI
  * So many things to be defined
  * [ ] a github icon, which points to the sources
  
    * [x] add them to the db
* text panel
  *  better representation
    * [x] show only english translation and showing a border for the current sentence. greying out the others
  * common words
    * [x] demphasize of common words (marked as data-common)
    * [ ] instead of a list of common words, derive it from the db. 
    * [ ] create a widget to change the proportion of words deemed as common
  * [ ] tabbing over words and display defn of the current one
  *  hovering a word should higlight the word and its translation
    * [ ] data comes from a teacher mode. The teacher should click a word then its translation so that hover one highlights the other
* wiktionary definition panel
   * [ ] clicking on a word should produce its definition. It worked, now broken
   * [ ] it should also show the non inflexed form
* [ ] using a ts adapter to sqlite
* [ ] some logic to support many documents and their translation. How to ask grok to produce
* [ ] a list of documents. Little prince comess to mind. And some Poutine, Lavrov addresses, but that's my bias.
* [ ] Using AI. I am using AI to produce the code. But AI should be used to learn russian as well. How ?
