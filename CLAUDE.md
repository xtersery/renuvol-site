# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

RENUVOL marketing website. This repository currently contains only the initial
project scaffolding — no design or implementation has been done yet.

## Stack

- Vite + vanilla HTML/CSS/JavaScript. No frontend framework.
- No CSS preprocessor or utility framework unless a future decision adds one.

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview production build
```

## Structure

- `public/` — static assets copied as-is at build time (video, images, documents, reference material).
- `content/` — source copy and factual content in markdown. Do not invent product facts, claims,
  or figures here; leave placeholders until real content is supplied.
- `src/` — application source: `index.html` entry point, `styles/`, `js/`, and `sections/`
  (individual page-section HTML fragments, numbered in page order).
- `references/` — external design/UX reference material, not part of the shipped site.
- `docs/` — planning and specification documents for this project.

## External expert libraries

Before any design or frontend implementation work, inspect:

- /references/design-dna
- /references/anthropics-skills
- /references/taste-skill
- /references/scroll-craft

Read relevant README.md and SKILL.md files before applying their methodology.

Use:

- design-dna for reference analysis and design-language extraction
- anthropics-skills as the full Anthropic skills library; select relevant skills based on the task
- taste-skill for premium frontend critique and anti-generic design decisions
- scroll-craft for scroll choreography, motion, video scrubbing and cinematic storytelling

These repositories are guidance libraries.
Do not modify their contents.
Do not blindly combine all techniques.
Select only what materially improves the RENUVOL website.

## Rules

- Do not fabricate product claims, certifications, statistics, or testimonials. Content files under
  `content/` and `docs/` should stay as placeholders until real information is provided.
- Keep the dependency footprint minimal — avoid adding packages unless there is a clear need.
