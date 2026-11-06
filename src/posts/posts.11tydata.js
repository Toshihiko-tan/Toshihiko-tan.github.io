// Defaults for every file in src/posts/.
// A file named 2026-11-05-my-post.md is published at /blog/my-post/ and dated 2026-11-05.
export default {
  layout: "post",
  tags: ["posts"],
  permalink: (data) => `/blog/${data.page.fileSlug}/`,
};
