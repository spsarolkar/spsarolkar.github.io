/* Progressive enhancement of the revision-pinned dataset inventory rendered by Jekyll. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root.document) {
    const start = function () {
      root.document.querySelectorAll("[data-sign-counts]").forEach(function (element) {
        api.initialise(element, root.document);
      });
    };
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  }
})(globalThis, function () {
  const splits = ["train", "validation", "test"];
  const splitNames = { train: "Train", validation: "Validation", test: "Test" };
  const repository = "spsarolkar/AI4Bharat-INCLUDE-dataset";
  const metrics = ["total", ...splits];
  const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
  const number = function (value) { return value.toLocaleString("en-IN"); };
  const nonempty = function (value) { return typeof value === "string" && value.trim().length > 0; };
  const count = function (value) { return Number.isSafeInteger(value) && value >= 0; };
  const fail = function () { throw new Error("Invalid dataset count snapshot"); };

  function validateSnapshot(payload) {
    if (!payload || !Array.isArray(payload.datasets) || payload.datasets.length !== 1) fail();
    const data = payload.datasets[0];
    if (!data || data.id !== "public-videos" || data.repository !== repository || !nonempty(data.label) || !/^[a-f0-9]{40}$/i.test(data.revision || "")) fail();
    if (!count(data.total) || !count(data.unique_labels) || !data.splits || !data.split_label_coverage) fail();
    if ([data.labels, data.categories, data.signs].some(function (rows) { return !Array.isArray(rows) || !rows.length; })) fail();
    if (!Array.isArray(data.notes) || data.notes.some(function (note) { return typeof note !== "string"; })) fail();
    const rowKeys = new Set();
    const signs = new Map();
    const groups = new Map();
    const totals = { train: 0, validation: 0, test: 0, total: 0 };
    data.labels.forEach(function (row) {
      if (!row || !nonempty(row.name) || !nonempty(row.category)) fail();
      const key = JSON.stringify([row.category, row.name]);
      if (rowKeys.has(key) || metrics.some(function (metric) { return !count(row[metric]); }) ||
          splits.reduce(function (sum, split) { return sum + row[split]; }, 0) !== row.total) fail();
      rowKeys.add(key);
      const group = groups.get(row.category) || { train: 0, validation: 0, test: 0, total: 0 };
      const sign = signs.get(row.name) || { train: 0, validation: 0, test: 0, total: 0, categories: new Set() };
      sign.categories.add(row.category);
      metrics.forEach(function (metric) { group[metric] += row[metric]; sign[metric] += row[metric]; totals[metric] += row[metric]; });
      groups.set(row.category, group);
      signs.set(row.name, sign);
    });
    if (signs.size !== data.unique_labels || totals.total !== data.total) fail();
    if (splits.some(function (split) { return totals[split] !== data.splits[split]; })) fail();
    const categories = new Set();
    data.categories.forEach(function (row) {
      if (!row || categories.has(row.name) || !groups.has(row.name)) fail();
      categories.add(row.name);
      if (metrics.some(function (metric) { return row[metric] !== groups.get(row.name)[metric]; })) fail();
    });
    if (categories.size !== groups.size) fail();
    data.signs.forEach(function (row) {
      const sign = row && signs.get(row.name);
      if (!sign || !Array.isArray(row.categories) || new Set(row.categories).size !== sign.categories.size ||
          row.categories.length !== sign.categories.size || row.categories.some(function (category) { return !sign.categories.has(category); }) ||
          metrics.some(function (metric) { return row[metric] !== sign[metric]; })) fail();
      signs.delete(row.name);
    });
    if (signs.size || splits.some(function (split) {
      return data.signs.filter(function (row) { return row[split] > 0; }).length !== data.split_label_coverage[split];
    })) fail();
    return payload;
  }

  function queryLabels(rows, options) {
    options = options || {};
    const search = typeof options.search === "string" ? options.search.trim().toLocaleLowerCase("en") : "";
    const category = options.category;
    const sorted = rows.filter(function (row) {
      const categories = row.categories || [row.category];
      return (!category || categories.includes(category)) && (!search || (row.name + " " + categories.join(" ")).toLocaleLowerCase("en").includes(search));
    });
    return sorted.sort(function (a, b) {
      let difference = 0;
      if (options.sort === "fewest") difference = a.total - b.total;
      else if (options.sort === "train") difference = a.train - b.train;
      else if (options.sort !== "name") difference = b.total - a.total;
      return difference || collator.compare(a.name, b.name) || collator.compare(a.category || "", b.category || "");
    });
  }

  function initialise(root, doc) {
    const find = function (name) { return root.querySelector("[data-sign-counts-" + name + "]"); };
    const status = find("results");
    let data;
    try { data = validateSnapshot(JSON.parse(find("json").textContent)).datasets[0]; }
    catch (_) {
      if (status) status.textContent = "Interactive counts are unavailable. Showing the saved dataset inventory.";
      return false;
    }
    const controls = { search: find("search"), sort: find("sort"), category: find("category"), more: find("more") };
    if (Object.values(controls).some(function (control) { return !control; }) || !find("labels")) return false;
    const signCounts = new Map(data.signs.map(function (row) { return [row.name, row]; }));
    const maximum = Math.max(1, ...data.signs.flatMap(function (row) { return splits.map(function (split) { return row[split]; }); }));
    let expanded = false;
    function element(tag, className, text) {
      const node = doc.createElement(tag);
      if (className) node.setAttribute("class", className);
      if (text !== undefined) node.textContent = text;
      return node;
    }
    function chartRow(row) {
      const item = element("li", "count-chart-row");
      const label = element("div", "count-chart-label");
      label.append(element("strong", "", row.name));
      label.append(element("small", "", row.category || row.categories.join(" · ")));
      const signTest = signCounts.get(row.name).test;
      if (row.category && row.test === 0 && signTest > 0) {
        label.append(element("small", "", number(signTest) + " test " + (signTest === 1 ? "clip" : "clips") + " across all categories"));
      }
      const bars = element("div", "count-chart-bars");
      splits.forEach(function (split) {
        const metric = element("div", "count-split");
        const track = element("span", "count-track");
        track.setAttribute("aria-hidden", "true");
        const fill = element("span", "count-fill split-" + split);
        fill.style.width = (100 * row[split] / maximum) + "%";
        track.append(fill);
        metric.append(element("span", "count-split-key", splitNames[split]), track, element("span", "count-value", number(row[split])));
        bars.append(metric);
      });
      item.append(label, bars);
      return item;
    }
    function renderLabels() {
      const category = controls.category.value;
      const rows = queryLabels(category ? data.labels : data.signs, { search: controls.search.value, category, sort: controls.sort.value });
      const shown = expanded ? rows : rows.slice(0, 20);
      find("labels").replaceChildren(...shown.map(chartRow));
      if (status) status.textContent = rows.length ? "Showing " + number(shown.length) + " of " + number(rows.length) + " signs." : "No matching signs. Try another search or category.";
      controls.more.hidden = rows.length <= 20;
      controls.more.textContent = expanded ? "Show first 20 signs" : "Show all " + number(rows.length) + " signs";
      controls.more.setAttribute("aria-expanded", String(expanded));
    }
    controls.search.addEventListener("input", function () { expanded = false; renderLabels(); });
    controls.sort.addEventListener("change", function () { expanded = false; renderLabels(); });
    controls.category.addEventListener("change", function () { expanded = false; renderLabels(); });
    controls.more.addEventListener("click", function () { expanded = !expanded; renderLabels(); });
    renderLabels();
    Object.values(controls).forEach(function (control) { control.disabled = false; });
    return true;
  }

  return { validateSnapshot: validateSnapshot, queryLabels: queryLabels, initialise: initialise };
});
