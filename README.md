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
- **SvelteKit 2.16.0** - Full-stack web application framework
- **Svelte 5.0.0** - Component framework with runes support
- **TypeScript** - Type-safe JavaScript
- **Vite 6.2.5** - Build tool and dev server

### Styling & UI Components
- **TailwindCSS 4.0.0** - Utility-first CSS framework
- **@skeletonlabs/skeleton 3.1.2** - UI component library
- **@tailwindcss/forms** - Form styling utilities
- **@tailwindcss/typography** - Typography utilities
- **lucide-svelte** - Icon library

### Layout Components
- **@rich_harris/svelte-split-pane 2.0.0** - Resizable split pane layouts

### Database & Content Processing
- **better-sqlite3** - SQLite database interface
- **jsdom** - DOM implementation for HTML processing

## Development

Use `pnpm` for package management:

1. Install dependencies:
```bash
pnpm install
```

2. Initialize the database by fetching Wiktionary data:
```bash
pnpm run process-content
```

3. Start the development server:
```bash
pnpm run dev
```

4. Open your browser to `http://localhost:5173`

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
- `/static` - Static assets and sample HTML files
- `/src/lib/db` - Database interactions and word processing
- `/scripts` - Content processing scripts

## Roadmap

- [ ] Implement spaced repetition learning
- [ ] Develop enhanced UI/UX
- [ ] Add support for additional texts beyond the 1978 Solzhenitsyn address
- [ ] Improve word definition caching

## License

MIT

