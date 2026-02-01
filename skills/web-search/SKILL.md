---
name: web-search
description: Search the web using Brave Search or Google. Use for current events, fact-checking, and finding external resources.
metadata: {"alize":{"emoji":"🔍","requires":{"tools":["web"]}}}
---

# Web Search

Use the `web` tool to search the internet or fetch page content.

## Actions

### Search
Perform a keyword search.

```javascript
web.search("latest news about AI")
```

### Fetch
Get the content of a specific URL (markdown converted).

```javascript
web.fetch("https://example.com/article")
```

## Tips
- Always check the date of the search results.
- Summarize findings for the user.
- If a user asks to "browse" a site, use `fetch` after finding the URL.
