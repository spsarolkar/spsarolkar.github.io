/* The nightly job owns this public JSON; gallery updates do not need a site build. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root.document) {
    const start = function () {
      const galleries = root.document.querySelectorAll("[data-credly-gallery]");
      if (!galleries.length) return;
      const badges = api.loadBadges(root.fetch.bind(root));
      galleries.forEach(function (gallery) { api.refreshGallery(gallery, badges, root.document); });
    };
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }
})(globalThis, function () {
  const feed = "https://raw.githubusercontent.com/spsarolkar/spsarolkar.github.io/master/_data/credly_badges.json";
  const imageOrigin = "https://spsarolkar.github.io";
  const credentialPath = /^\/badges\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i;
  const text = function (value) { return typeof value === "string" ? value.trim() : ""; };

  function normalizeBadges(payload) {
    if (!Array.isArray(payload) || !payload.length) throw new Error("Empty badge collection");
    const unique = new Map();
    payload.forEach(function (record) {
      if (!record || !text(record.name)) throw new Error("Invalid badge record");
      const url = new URL(text(record.url));
      const match = url.pathname.match(credentialPath);
      if (url.protocol !== "https:" || !["www.credly.com", "credly.com"].includes(url.hostname) || !match) throw new Error("Invalid credential URL");
      const image = new URL(text(record.image340) || text(record.image), imageOrigin);
      if (image.protocol !== "https:" || !(image.hostname === "images.credly.com" || (image.origin === imageOrigin && image.pathname.startsWith("/assets/")))) throw new Error("Invalid badge image");
      unique.set(match[1].toLowerCase(), {
        name: text(record.name), issuer: text(record.issuer), url: url.href, image: image.href,
        issued: text(record.issued), issuedLabel: text(record.issuedLabel),
        expires: text(record.expires), expiresLabel: text(record.expiresLabel),
      });
    });
    return Array.from(unique.values());
  }

  async function loadBadges(fetcher) {
    const controller = new AbortController();
    const timeout = setTimeout(function () { controller.abort(); }, 10000);
    try {
      const response = await fetcher(feed, { cache: "no-store", credentials: "omit", signal: controller.signal });
      if (!response.ok) throw new Error("Badge feed unavailable");
      return normalizeBadges(await response.json());
    } finally { clearTimeout(timeout); }
  }

  function badgeCard(record, doc) {
    const card = doc.createElement("article");
    card.setAttribute("class", "badge-item");
    const link = doc.createElement("a");
    link.setAttribute("class", "credly-badge-link");
    link.setAttribute("href", record.url);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    const image = doc.createElement("img");
    for (const [name, value] of Object.entries({ src: record.image, alt: "", width: "100", height: "100", loading: "lazy" })) image.setAttribute(name, value);
    const title = doc.createElement("h4");
    title.setAttribute("class", "credential-title");
    title.textContent = record.name;
    link.append(image, title);
    card.append(link);
    function metadata(value) {
      const paragraph = doc.createElement("p");
      paragraph.setAttribute("class", "credential-meta");
      paragraph.textContent = value;
      card.append(paragraph);
    }
    if (record.issuer) metadata(record.issuer);
    if (record.issued) metadata("Issued " + (record.issuedLabel || record.issued));
    if (record.expires) metadata("Expires " + (record.expiresLabel || record.expires));
    return card;
  }

  async function refreshGallery(gallery, recordsPromise, doc) {
    const status = gallery.querySelector("[data-credly-status]");
    try {
      const records = await recordsPromise;
      const limit = Number(gallery.getAttribute("data-credly-limit"));
      const displayed = limit > 0 ? records.slice(0, limit) : records;
      const fragment = doc.createDocumentFragment();
      displayed.forEach(function (record) { fragment.append(badgeCard(record, doc)); });
      gallery.querySelector("[data-credly-grid]").replaceChildren(fragment);
      gallery.querySelector("[data-credly-count]").textContent = String(records.length);
      const all = gallery.querySelector("[data-credly-all-link]");
      if (all) all.textContent = "View all " + records.length + " badges";
      status.textContent = "Refreshed from the latest badge collection.";
    } catch (_) {
      status.textContent = "Showing saved badge records. The full collection is also available on Credly.";
    }
  }

  return { normalizeBadges, loadBadges, refreshGallery };
});
