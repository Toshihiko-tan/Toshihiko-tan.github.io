// Light / dark theme toggle. The saved choice is applied early by an inline
// script in <head>; with no saved choice the site follows the system setting.
const root = document.documentElement;
document.querySelector(".theme-toggle")?.addEventListener("click", () => {
  const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
});

// Publication "Abstract" / "BibTeX" buttons. Only one panel per entry is open at a time.
const setOpen = (button, open) => {
  button.setAttribute("aria-expanded", String(open));
  document.getElementById(button.getAttribute("aria-controls"))?.classList.toggle("is-open", open);
};
document.querySelectorAll("[data-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.closest(".pub")?.querySelectorAll("[data-toggle]").forEach((other) => setOpen(other, false));
    setOpen(button, open);
  });
});

// "Print" button on the CV page (shown when there is no PDF).
document.querySelector("[data-print]")?.addEventListener("click", () => window.print());

// CV page: switch between the embedded PDF and the web version.
const cvViewButtons = document.querySelectorAll("[data-cv-view]");
cvViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".cv-body")?.setAttribute("data-view", button.dataset.cvView);
    cvViewButtons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
  });
});

// Life page: tag shows that haven't happened yet. Done in the browser so the tag
// disappears on its own after the date, without rebuilding the site.
const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in the visitor's time zone
document.querySelectorAll("[data-show-date]").forEach((show) => {
  if (show.dataset.showDate >= today) {
    show.querySelector(".show-title")?.insertAdjacentHTML("beforeend", ' <span class="badge">Upcoming</span>');
  }
});

// Ramen log page: filter visits by type, place and a search box.
const log = document.querySelector("[data-log]");
if (log) {
  const rows = [...log.querySelectorAll("tbody tr")];
  const typeButtons = document.querySelectorAll("[data-log-type]");
  const placeSelect = document.querySelector("[data-log-place]");
  const searchInput = document.querySelector("[data-log-search]");
  const count = document.querySelector("[data-log-count]");
  const empty = log.querySelector("[data-log-empty]");
  let type = "";

  const update = () => {
    const place = placeSelect.value;
    const words = searchInput.value.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const row of rows) {
      const text = row.textContent.toLowerCase();
      const ok =
        (!type || row.dataset.type === type) &&
        (!place || row.dataset.place === place) &&
        words.every((w) => text.includes(w));
      row.hidden = !ok;
      if (ok) shown++;
    }
    // Hide a year's heading and table when none of its visits match.
    log.querySelectorAll("[data-log-year]").forEach((year) => {
      year.hidden = !year.querySelector("tbody tr:not([hidden])");
    });
    empty.hidden = shown > 0;
    count.textContent = shown === rows.length ? `${rows.length} visits` : `Showing ${shown} of ${rows.length} visits`;
  };

  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      type = button.dataset.logType;
      typeButtons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      update();
    });
  });
  placeSelect.addEventListener("change", update);
  searchInput.addEventListener("input", update);
  update();
}

// "Copy" button on BibTeX panels.
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = document.getElementById(button.dataset.copy)?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text.trim());
      button.textContent = "Copied";
    } catch {
      button.textContent = "Press ⌘C / Ctrl+C";
    }
    setTimeout(() => (button.textContent = "Copy"), 1600);
  });
});
