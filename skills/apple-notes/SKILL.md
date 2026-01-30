---
name: apple-notes
description: Manage Apple Notes via the `memo` CLI on macOS (create, view, edit, delete, search, move, and export notes). Use when a user asks Alizé to add a note, list notes, search notes, or manage note folders.
homepage: https://github.com/antoniorodr/memo
metadata: {"alize":{"emoji":"📝","os":["darwin"],"requires":{"bins":["memo"]},"install":[{"id":"brew","kind":"brew","formula":"antoniorodr/memo/memo","bins":["memo"],"label":"Install memo via Homebrew"}]}}
---

# Apple Notes CLI

Use `memo notes` to manage Apple Notes directly from the terminal. Create, view, edit, delete, search, move notes between folders, and export to HTML/Markdown.

Setup
- Install (Homebrew): `brew tap antoniorodr/memo && brew install antoniorodr/memo/memo`
- Manual (pip): `pip install .` (after cloning the repo)
- macOS-only; if prompted, grant Automation access to Notes.app.

View Notes
- List all notes: `memo notes`
- Filter by folder: `memo notes -f "Folder Name"`
- Search notes (fuzzy): `memo notes -s "query"`

Create Notes

> [!CAUTION]
> ## ⚠️ POUR CRÉER UNE NOTE (NON-INTERACTIF):
>
> **`memo notes -a` ouvre un éditeur interactif et NE FONCTIONNE PAS avec exec!**
>
> **Utilisez AppleScript avec `osascript` à la place:**
> ```bash
> osascript -e 'tell application "Notes" to make new note at folder "Notes" with properties {name:"TITRE", body:"CONTENU DE LA NOTE"}'
> ```
>
> **Exemple avec formatage (HTML supporté):**
> ```bash
> osascript -e 'tell application "Notes" to make new note at folder "Notes" with properties {name:"Titre Note", body:"<h1>Grand Titre</h1><p>Paragraphe avec <b>gras</b>.</p><ul><li>Liste 1</li><li>Liste 2</li></ul><br><table border=\"1\"><tr><th>Col 1</th><th>Col 2</th></tr><tr><td>Val A</td><td>Val B</td></tr></table>"}'
> ```
>
> ⚠️ **IMPORTANT: Apple Notes does NOT support Markdown inside the body!**
> - ❌ DO NOT use `| Col 1 | Col 2 |` (Markdown tables) - it will render as raw text.
> - ✅ YOU MUST USE HTML `<table>`, `<tr>`, `<td>` for tables.
> - ✅ YOU MUST USE HTML `<h1>`, `<b>`, `<ul>`, `<li>` for formatting.
>
> **Exemple complet (simplifié):**
> ```bash
> osascript -e 'tell application "Notes" to make new note at folder "Notes" with properties {name:"Ma Note", body:"Contenu simple.\n\nNouvelle ligne."}'
> ```

- Interactive (NE PAS UTILISER): `memo notes -a` - Opens an interactive editor
- **Non-interactive (UTILISER CECI)**: `osascript -e 'tell application "Notes"...'`

Edit Notes
- Edit existing note: `memo notes -e`
  - Interactive selection of note to edit.

Delete Notes
- Delete a note: `memo notes -d`
  - Interactive selection of note to delete.

Move Notes
- Move note to folder: `memo notes -m`
  - Interactive selection of note and destination folder.

Export Notes
- Export to HTML/Markdown: `memo notes -ex`
  - Exports selected note; uses Mistune for markdown processing.

Limitations
- Cannot edit notes containing images or attachments.
- Interactive prompts may require terminal access.

Notes
- macOS-only.
- Requires Apple Notes.app to be accessible.
- For automation, grant permissions in System Settings > Privacy & Security > Automation.
