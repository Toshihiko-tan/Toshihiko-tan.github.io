import fs from "node:fs";
import { load as loadYaml } from "js-yaml";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItKatex from "@vscode/markdown-it-katex";
import markdownItFootnote from "markdown-it-footnote";
import { siBluesky, siGithub, siGooglescholar, siOrcid, siX } from "simple-icons";

// `npm run build` (production) vs. `npm start` (local preview).
const isProduction = process.env.ELEVENTY_RUN_MODE === "build";
const site = loadYaml(fs.readFileSync("src/_data/site.yaml", "utf8"));

// ---------------------------------------------------------------------------
// Icons: brand marks from Simple Icons (CC0), UI glyphs from Lucide (ISC).
// ---------------------------------------------------------------------------
const brandIcons = {
  github: siGithub,
  scholar: siGooglescholar,
  orcid: siOrcid,
  bluesky: siBluesky,
  x: siX,
};
const strokeIcons = {
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  cv: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  rss: '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 21a9 9 0 0 0 0-18Z" fill="currentColor"/>',
};

function icon(name) {
  const attrs = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
  if (brandIcons[name]) {
    return `<svg class="icon icon-${name}" ${attrs} fill="currentColor"><path d="${brandIcons[name].path}"/></svg>`;
  }
  if (strokeIcons[name]) {
    return `<svg class="icon icon-${name}" ${attrs} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${strokeIcons[name]}</svg>`;
  }
  throw new Error(`Unknown icon "${name}"`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const toDate = (v) => (v instanceof Date ? v : new Date(v));
const dateFormat = (options) => (v) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(toDate(v));
const normalizeName = (s) => String(s).toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ").trim();

export default function (eleventyConfig) {
  // YAML data files (site.yaml, publications.yaml, news.yaml)
  eleventyConfig.addDataExtension("yaml,yml", (contents) => loadYaml(contents));

  // Static files
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets", "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/katex/dist/katex.min.css": "assets/katex/katex.min.css",
    "node_modules/katex/dist/fonts": "assets/katex/fonts",
  });

  // Anything with `draft: true` shows up in `npm start` but never in the production build.
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && isProduction) return false;
  });
  eleventyConfig.addGlobalData("isProduction", isProduction);
  eleventyConfig.addGlobalData("buildTime", Date.now());
  eleventyConfig.addGlobalData("buildYear", new Date().getFullYear());

  // Friendly layout names for front matter: `layout: post`, `layout: page`, ...
  for (const name of ["base", "home", "page", "post", "research"]) {
    eleventyConfig.addLayoutAlias(name, `layouts/${name}.njk`);
  }

  // Markdown: smart quotes, $math$ via KaTeX (rendered at build time), footnotes.
  let markdown;
  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ typographer: true });
    md.use(markdownItKatex.default ?? markdownItKatex);
    md.use(markdownItFootnote);
    markdown = md;
  });
  eleventyConfig.addPlugin(syntaxHighlight);

  // Only pages that actually contain math load the KaTeX stylesheet.
  eleventyConfig.addTransform("katex-css", function (content) {
    if (this.page.outputPath?.endsWith(".html") && content.includes('class="katex')) {
      return content.replace("</head>", '  <link rel="stylesheet" href="/assets/katex/katex.min.css">\n</head>');
    }
    return content;
  });

  // Atom feed for the blog at /feed.xml
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: site.lang || "en",
      title: `${site.name} · Blog`,
      subtitle: site.description,
      base: site.url.replace(/\/?$/, "/"),
      author: { name: site.name },
    },
  });

  // Shortcodes
  eleventyConfig.addShortcode("icon", icon);

  // Filters: dates
  eleventyConfig.addFilter("readableDate", dateFormat({ year: "numeric", month: "long", day: "numeric" }));
  eleventyConfig.addFilter("shortDate", dateFormat({ year: "numeric", month: "short", day: "numeric" }));
  eleventyConfig.addFilter("monthYear", dateFormat({ year: "numeric", month: "short" }));
  eleventyConfig.addFilter("isoDate", (v) => toDate(v).toISOString().slice(0, 10));

  // Filters: lists
  eleventyConfig.addFilter("published", (items = []) => items.filter((i) => !(i.draft && isProduction)));
  eleventyConfig.addFilter("selected", (items = []) => items.filter((i) => i.selected));
  eleventyConfig.addFilter("newestFirst", (items = []) => [...items].reverse());
  eleventyConfig.addFilter("byDateDesc", (items = []) => [...items].sort((a, b) => toDate(b.date) - toDate(a.date)));
  eleventyConfig.addFilter("limit", (items = [], n = 5) => items.slice(0, n));
  eleventyConfig.addFilter("withoutPostsTag", (tags = []) => [].concat(tags).filter((t) => t !== "posts"));
  eleventyConfig.addFilter("groupByYear", (pubs = []) => {
    const groups = new Map();
    for (const pub of [...pubs].sort((a, b) => b.year - a.year)) {
      if (!groups.has(pub.year)) groups.set(pub.year, []);
      groups.get(pub.year).push(pub);
    }
    return [...groups].map(([year, items]) => ({ year, items }));
  });

  // Filters: text
  eleventyConfig.addFilter("inlineMarkdown", (s) => markdown.renderInline(String(s ?? "")));
  eleventyConfig.addFilter("readingTime", (html) => {
    const words = String(html).replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 230))} min read`;
  });

  // Filters: publications. Names passed in `myNames` (site.yaml → author_names) are bolded;
  // trailing *, † or ‡ on a name are shown as superscript contribution marks.
  eleventyConfig.addFilter("authorList", (authors = [], myNames = []) => {
    const mine = new Set(myNames.map(normalizeName));
    return authors
      .map((author) => {
        const [, name, marks] = String(author).match(/^(.*?)\s*([*†‡]*)$/);
        const html = escapeHtml(name) + (marks ? `<sup>${escapeHtml(marks)}</sup>` : "");
        return mine.has(normalizeName(name)) ? `<strong class="me">${html}</strong>` : html;
      })
      .join(", ");
  });
  eleventyConfig.addFilter("hasEqualContribution", (pubs = []) =>
    pubs.some((p) => (p.authors || []).some((a) => /\*\s*$/.test(a))),
  );
}

export const config = {
  dir: { input: "src", output: "_site" },
  templateFormats: ["md", "njk", "html"],
  htmlTemplateEngine: "njk",
  // Markdown is not run through Nunjucks, so LaTeX and code with {{ }} or {# #} are safe.
  markdownTemplateEngine: false,
};
