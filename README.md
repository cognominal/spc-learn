# Spaced repetition learning

A web application that helps users understand Russian text by making words
interactive and providing instant translations and definitions.

## Augment

I am experiencing with vibe coding using the vscode extension augment.
I got mixed résult. It is very good at writing code with "algorithmic features".
But it tends to confuse svelte 4 and 5, and tailwind 3 and 4.
So I got into a mess with tailwind.
Also I don't master yet the augment ext UI features.

## App Features

## Before

- Processes HTML content containing Russian text
- Automatically detects and highlights Russian words
- Click on any Russian word to see its definition from Wiktionary
- Clean, modern interface with popup definitions
- SQLite database integration for storing word definitions

### Now

Nothing, just a dummy app bar and splitted pane with
On another repo, I got what was described before but the
tailwind/skeleton config was hopelessly messed up.
So I start with a clean slate.

### Later

Note : specifying the desired feature is preparing a prompt to augment.

Getting back the code of before with the features. Need better features that
leverage a cleaner UI.


Need a mode with only the russian sentences with the original paragraph layout.
One should click on a russian sentence and get the other grayed out and get the
translation.

Need a teacher mode to associate a word to its translation, doing so by
clicking a word then its translation, resetting an association by clicking a
word. Then when the user over a word (english or russian), it highlight the
other Same for multiword expression Both features available at the same time.

Need to better leverage wiktionnary. Some words are derivative from other
sometimes from [declension](https://en.wikipedia.org/wiki/Declension). Must get
and display the entry for the original word it is derived from. Thats the
original word that should be the basis for spaced repetition.

Also identify [affixes](https://en.wikipedia.org/wiki/Affix)
and remember the words that use them.

Given a word, remember all the uses across many documents. We currently have
only one.

think a way to learn about grammar and declensions.

Use a ts interace for sql.



## Technical Stack

### Core Framework & UI
- [**SvelteKit 2.16.0**](https://kit.svelte.dev/) - Full-stack web application framework ([GitHub](https://github.com/sveltejs/kit))
- [**Svelte 5.0.0**](https://svelte.dev/) - Component framework with runes support ([GitHub](https://github.com/sveltejs/svelte))
- [**TypeScript**](https://www.typescriptlang.org/) - Type-safe JavaScript ([GitHub](https://github.com/microsoft/TypeScript))
- [**Vite 6.2.5**](https://vitejs.dev/) - Build tool and dev server ([GitHub](https://github.com/vitejs/vite))

### Styling & UI Components
- [**TailwindCSS 4.0.0**](https://tailwindcss.com/) - Utility-first CSS framework ([GitHub](https://github.com/tailwindlabs/tailwindcss))
- [**@skeletonlabs/skeleton 3.1.2**](https://www.skeleton.dev/) - UI component library ([GitHub](https://github.com/skeletonlabs/skeleton))
- [**@tailwindcss/forms**](https://github.com/tailwindlabs/tailwindcss-forms) - Form styling utilities
- [**@tailwindcss/typography**](https://tailwindcss.com/docs/typography-plugin) - Typography utilities ([GitHub](https://github.com/tailwindlabs/tailwindcss-typography))
- [**lucide-svelte**](https://lucide.dev/docs/lucide-svelte) - Icon library ([GitHub](https://github.com/lucide-icons/lucide))

### Layout Components
- [**@rich_harris/svelte-split-pane 2.0.0**](https://www.npmjs.com/package/@rich_harris/svelte-split-pane) - Resizable split pane layouts ([GitHub](https://github.com/Rich-Harris/svelte-split-pane))

### Database & Content Processing
- [**sqlite3**](https://github.com/sqlite/sqlite) - SQLite database interface
- [**jsdom**](https://github.com/jsdom/jsdom) - DOM implementation for HTML processing

## Development

We assume that the follwing are installed
*  [nodejs](https://nodejs.org/en), the javascript runtime
*  pnpm ([docs](https://pnpm.io/), [package](https://www.npmjs.com/package/pnpm)) .

npm, installed with nodejs, should do though

Use `pnpm` for package management:

1. Install dependencies:
```bash
pnpm install
```

2. Initialize the database by fetching Wiktionary data:
```bash
pnpm run process-content
```

3. Access the admin menu for various maintenance tasks:
```bash
pnpm run admin
```

The admin menu provides access to various scripts for database management, content processing, and other administrative tasks.

4. Start the development server:
```bash
pnpm run dev
```

4. Open your browser to `http://localhost:5173` (5173 or the chosen port)

    Shortcuts
     press r + enter to restart the server
     press u + enter to show server url
     press o + enter to open in browser
     press c + enter to clear console
     press q + enter to quit


## Building

Create a production version:
```bash
pnpm run build
```

Preview the production build:
```bash
pnpm run preview
```

## Project Structure

- `/src/routes` - SvelteKit routes and components
- `/src/lib` - Shared utilities and components
- `src/lib/server` - Server-side processing and database interactions
- `src/lib/workers` - Web workers 
- `/static` - Static assets and sample HTML files
- `/src/lib/db` - Database interactions and word processing
- `/scripts` - Content processing scripts

## Roadmap

- [ ] Implement spaced repetition learning
- [ ] Develop enhanced UI/UX
- [ ] Add support for additional texts beyond the 1978 Solzhenitsyn address
- [ ] Improve word definition caching

See also [subgoals](subgoals.md), for a pointillist view of progress
and [flow](./flow.md) for the general flow of information

## License

[MIT](LICENSE)


## File processing

We started from a session in grok about Soljenitzine's address.
We need to use the format for further document.
The current downside is that the layout in paragraphs is lost

We got a file from grok in `/static/raw-file-from-grok.html`.
We process it to suit our purpose. Most notably we create a
span for each russian word

```html
<span class="russian-word" data-word="Я">Я</span>
```

When loading the page or when the page is loaded it.
We may chose to hide section (for example to keep only russian )
[See](#later)

# Syntactical conventions as per .prettierrc.yaml

Apparently the format on save does not handle the trailingComma.

```yaml
singleQuote: true
semi: false
trailingComma: all
tabWidth: 2
useTabs: false
printWidth: 80
```