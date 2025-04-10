# Subgoals

I got up to a relatively sane state with a lot of code produced
by augment which helps to develop from a semi real example, the
Soljenitzine's address. This list should help to go forward and track progress.

## cleaning

* [ ] words-dump.yaml should be done alphabetically for a smaller diff
* [ ] use skeleton widgets (already done for closing the wikt defn panel)
* [ ] support devices of different sizes
* [x] cleaning junk in the wikt defn panel
* [ ] how to focus on the translation in the defn panel

## deploy

* [ ] deploy on [vercel](https://vercel.com/). vercel has a ro fs so it should not update
the db.  [render](https://render.com/) should be the preferred choice. Augment has generated code to support both cases

## new routes/pages
* [ ] a route for learning the grammars terms so as to be able to read the wiktionary pages in the target language (now russian)
* [ ] a route for the 1000 more common words grouped by their non inflexion form. Need to find examples.
* [ ] an about page
* [ ] and admin route to facilitate import of traductions, like verifying if the original and the translation match.

## features

* [ ] make tne many admin scripts one with a choice menu like the svelte sv script does 
* [ ] choice of wiktionary language (see /grammar route). means changing the db schema

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
  * [ ] tabbing over non common words and display defn of the current one. or maybe two modes. tabbing over sentences or words. Currently it navigates between the left over of grok items
  *  hovering a word should higlight the word and its translation
    * [ ] data comes from a teacher mode. The teacher should click a word then its translation so that hover one highlights the other
* wiktionary definition panel
   * [x] a x lucide widget to close the panel
   * [x] clicking on a word should produce its definition. 
   * [ ] it should also show the non inflexed form
   * [ ] clicking on a word outside the current section should change the section
   * [ ]

* [ ] using a ts adapter to sqlite
* [ ] some logic to support many documents and their translation. How to ask grok to produce suitable document
* [ ] a list of documents. Little prince comess to mind. And some Poutine, Lavrov addresses, but that's my bias.
* [ ] Using AI. I am using AI to produce the code. But AI should be used to learn russian as well. How ?
* [ ] dark mode

## Annoyances

small bugs that should be fixed. or minor missing features

On initial click, we are on a new presentation with
the current sentence emphasized and the rest deemphasized

[ ] fix weird jump on initial click
[ ] maybe some transition after clicking
[ ] inconsistency. the strong "english/russian" are left on first click but hidden after
[ ] the beginning of the address is lost
[ ] there shouild be no lower panel at the beginning
[ ] random icons on the header. make it functionnal
[ ] navigating away from the defn should be more conspicuous. An easy way to get back to it should be provided
[ ] better message when the defn is not found

## to investigate and fix

I want to go full tw. But below the vanilla way and the tw way are not
equivalent as they should be. Probably some css rule take precedence of the
tw one.

```svelte
    {#snippet a()}
      <!-- <div class="h-full p-4 overflow-y-auto"> -->
      <div style="height: 100%; overflow-y: auto;"
```
