# toshihiko-tan.github.io

Source for my personal academic website: research, publications, a blog and news.
It's built with [Eleventy](https://www.11ty.dev/) and published to GitHub Pages automatically
on every push to `main`.

## Run it locally

You need Node.js 20 or newer.

```bash
npm install     # first time only
npm start       # preview at http://localhost:8080, reloads as you edit
```

`npm run build` writes the production site to `_site/`. It's the same build GitHub runs.

## Where things live

| To change…                                         | Edit                          |
| -------------------------------------------------- | ----------------------------- |
| Name, title, links, photo, menu, education         | `src/_data/site.yaml`         |
| Bio on the home page                               | `src/index.md`                |
| Intro text on the Research page                    | `src/research.md`             |
| Publications (Research, home and CV pages)         | `src/_data/publications.yaml` |
| Software and datasets (Research page)              | `src/_data/software.yaml`     |
| Experience, talks, honors, skills, outreach (CV)   | `src/_data/cv.yaml`           |
| News items                                         | `src/_data/news.yaml`         |
| Blog posts                                         | `src/posts/`                  |
| Colors and fonts                                   | `src/assets/css/style.css`    |

### Photo and CV

- The photo is `src/assets/img/profile.jpg` (square; it's shown as a small circle). Replace the file
  to change it.
- The CV page (`/cv/`) shows the PDF at `src/assets/pdf/cv.pdf`, with a **Download PDF** button.
  To update it, compile your LaTeX CV and replace that file. Everything in the PDF is public, so leave
  out anything you don't want online (the current copy has no phone number).
- A **PDF / Web version** switch on the CV page shows a web version instead. It's built from `cv.yaml`,
  the education list in `site.yaml` and `publications.yaml`. On phones, which can't show a PDF inside
  a page, visitors see the web version and the Download button.
- Set `cv_pdf: ""` in `site.yaml` to drop the PDF and show only the web version.

### Life page

`/life/` is the personal page: Music (bands, shows, radio), Travel (Japan's 47 prefectures),
Kendo (clubs and rank exams) and Ramen, with numbered panels at the top that jump to each section.
Everything on it comes from `src/_data/life.yaml`, and the comments there explain each field.

Add `draft: true` to any entry to keep it to your local preview while you write it. More sections
can be added the same way, each with its own panel in `src/life.njk`.

### Home page panels (set aside)

The home page used to have tall numbered panels with sideways type beside your name. They're
switched off for now, and your name block is centered instead. Everything needed to bring them back
is kept: the markup in `src/_includes/partials/panels.njk` (also used on the Life page), the links in `featured` in `site.yaml`,
and the styles under "Panels" in `style.css` (with a note on the one layout change needed).
The menu at the top of every page comes from `nav` in `site.yaml`.

### Publications

Each entry in `publications.yaml` needs a `title`, `authors` and `year`. Optional fields add a venue,
a badge (for example "Preprint"), link buttons (PDF, Code, …), an Abstract toggle and a BibTeX toggle
with a copy button. Set `selected: true` to feature a paper on the home page. The comments at the top
of the file list every field.

### Writing a blog post

Create `src/posts/YYYY-MM-DD-short-title.md`:

```md
---
title: My post title
description: One sentence, shown in the post list and in link previews.
tags: [methods]
---

Write in Markdown. Inline math like $\theta$ and display math like

$$
\hat{\theta} = \arg\max_\theta \, \ell(\theta)
$$

are rendered with KaTeX. Fenced code blocks are syntax highlighted.
```

It is published at `/blog/short-title/` and added to the RSS feed at `/feed.xml`.
Posts can also use tables and footnotes (`text[^1]`, then `[^1]: The note.` at the end).

### Drafts

Add `draft: true` to a post's front matter, or to an entry in `publications.yaml` or `news.yaml`.
Drafts show up (with a yellow DRAFT label) when you run `npm start`, but are left out of the
published site.

### Adding a page

Create, for example, `src/teaching.md`:

```md
---
layout: page
title: Teaching
---

Content in Markdown…
```

Then add it to `nav` in `site.yaml` so it shows in the menu.

## Deployment

`.github/workflows/deploy.yml` builds the site and publishes it whenever `main` changes.
One-time setup on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
