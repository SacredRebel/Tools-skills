# Tools & Skills — Resource OS

A living searchable library for the websites, code repositories, skills, AI agent integrations, multimedia tools, research projects and frameworks in your working toolkit.

**Repo:** https://github.com/SacredRebel/Tools-skills  
**Source catalog:** [catalog/tools.json](catalog/tools.json)  
**AI operating instructions:** [AGENTS.md](AGENTS.md)  
**Machine discovery:** [llms.txt](llms.txt) and deployed `/api/tools`.

## What is included

- Continuously expanded collection: the original links, [dashboard-tools-](https://github.com/SacredRebel/dashboard-tools-) reference, and curated additions spanning CAD, architecture, 3D, UI/UX, agent skills, calendars, email, SEO and more.
- Dynamic category navigation, keyword tags, use cases, source type, archival flags and timestamps. The dashboard calculates the current resource and category counts from the JSON catalog.
- Fast visual dashboard with lazy-loaded page/repository preview images, search, categories, types, sorting, favorites and a details dialog.
- Persistent browser-only personal drafts and favorites; JSON export for portability.
- GitHub-backed source and a Save-to-GitHub issue submission route for permanent additions.
- Agent-ready raw JSON, `AGENTS.md`, and `llms.txt` to share with other LLMs.

## Start locally

```bash
npm test
npm run validate
npm run build
npx serve dist
```

No third-party JavaScript dependencies are required. Vercel builds with `npm run build` and publishes `dist/` automatically when its Git-connected project deploys `main`.

## Adding a new resource

From the dashboard, fill in name, URL, category, type, description and tags. **Save locally** stores a personal draft in your current browser. **Save to GitHub** creates a prefilled GitHub issue: review it, then click Submit in GitHub. A GitHub Actions workflow can validate and commit repo-owner submissions automatically. If branch protection or Actions permissions block pushing to `main`, copy the proposed JSON into `catalog/tools.json` using a PR instead. You can also edit the JSON directly and run `npm test`. Allowed categories and kinds are listed in [catalog/schema.json](catalog/schema.json); add a new one there in the same change that first uses it.

### Data trust

The library records *where a tool is and why it might help* — not a guarantee of safety, currency, cost or correct installation. Other people's repos retain their own licenses. External image previews use GitHub OpenGraph and WordPress mshots services; previews are progressively/lazily loaded and may be unavailable. Do not put secrets or private project information in this public repository.

### Agent-use prompt

> Read https://github.com/SacredRebel/Tools-skills/blob/main/AGENTS.md and catalog/tools.json, then recommend the smallest appropriate tool stack for my current workflow. Explain why, verify official setup, cost, access and license, and ask permission before installing anything.

## Architecture

Plain HTML/CSS/JS for fast startup, a versioned GitHub JSON catalog, a Node.js no-dependency validator/build, and Vercel static hosting. This library is independent from the dashboard-tools- repo and can link to it when relevant.
