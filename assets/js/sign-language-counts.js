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
  const repositories = {
    "apple-vision": "spsarolkar/AI4Bharat-INCLUDE-keypoints",
    "public-videos": "spsarolkar/AI4Bharat-INCLUDE-dataset",
  };
  const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
  const number = function (value) { return value.toLocaleString("en-IN"); };
  const nonempty = function (value) { return typeof value === "string" && value.trim().length > 0; };
  const count = function (value) { return Number.isSafeInteger(value) && value >= 0; };
  const fail = function () { throw new Error("Invalid dataset count snapshot"); };

  function validateSnapshot(payload) {
    if (!payload || !Array.isArray(payload.datasets) || payload.datasets.length !== 2) fail();
    const ids = new Set();
    payload.datasets.forEach(function (data) {
      if (!data || !Object.prototype.hasOwnProperty.call(repositories, data.id) || ids.has(data.id)) fail();
      ids.add(data.id);
      if (data.repository !== repositories[data.id] || !nonempty(data.label) || !/^[a-f0-9]{40}$/i.test(data.revision || "")) fail();
      if (!count(data.total) || !count(data.unique_labels) || !Array.isArray(data.labels) || !data.labels.length || !Array.isArray(data.categories) || !data.categories.length) fail();
      if (!Array.isArray(data.notes) || data.notes.some(function (note) { return typeof note !== "string"; })) fail();
      if (!data.splits || splits.some(function (split) { return !count(data.splits[split]); })) fail();
      const rowKeys = new Set();
      const names = new Set();
      const groups = new Map();
      const totals = { train: 0, validation: 0, test: 0, total: 0 };
      data.labels.forEach(function (row) {
        if (!row || !nonempty(row.name) || !nonempty(row.category)) fail();
        const key = JSON.stringify([row.category, row.name]);
        if (rowKeys.has(key)) fail();
        rowKeys.add(key); names.add(row.name);
        if (!count(row.total) || splits.some(function (split) { return !count(row[split]); }) || splits.reduce(function (sum, split) { return sum + row[split]; }, 0) !== row.total) fail();
        const group = groups.get(row.category) || { train: 0, validation: 0, test: 0, total: 0 };
        ["total"].concat(splits).forEach(function (key) { group[key] += row[key]; totals[key] += row[key]; });
        groups.set(row.category, group);
      });
      if (names.size !== data.unique_labels || totals.total !== data.total || !Number.isSafeInteger(totals.total)) fail();
      if (splits.some(function (split) { return totals[split] !== data.splits[split]; })) fail();
      const categories = new Set();
      data.categories.forEach(function (row) {
        if (!row || !nonempty(row.name) || categories.has(row.name) || !groups.has(row.name)) fail();
        categories.add(row.name);
        if (["total"].concat(splits).some(function (key) { return !count(row[key]) || row[key] !== groups.get(row.name)[key]; })) fail();
      });
      if (categories.size !== groups.size) fail();
    });
    return payload;
  }

  function queryLabels(rows, options) {
    options = options || {};
    const search = typeof options.search === "string" ? options.search.trim().toLocaleLowerCase("en") : "";
    const category = options.category;
    const sorted = rows.filter(function (row) {
      return (!category || category === "all" || row.category === category) && (!search || (row.name + " " + row.category).toLocaleLowerCase("en").includes(search));
    });
    return sorted.sort(function (a, b) {
      let difference = 0;
      if (options.sort === "fewest") difference = a.total - b.total;
      else if (options.sort === "train") difference = a.train - b.train;
      else if (options.sort !== "name") difference = b.total - a.total;
      return difference || collator.compare(a.name, b.name) || collator.compare(a.category, b.category);
    });
  }

  function initialise(root, doc) {
    const find = function (name) { return root.querySelector("[data-sign-counts-" + name + "]"); };
    const status = find("results");
    let snapshot;
    try { snapshot = validateSnapshot(JSON.parse(find("json").textContent)); }
    catch (_) {
      if (status) status.textContent = "Interactive counts are unavailable. Showing the saved dataset inventory.";
      return false;
    }
    const controls = { source: find("source"), search: find("search"), sort: find("sort"), category: find("category"), more: find("more") };
    if (Object.values(controls).some(function (control) { return !control; }) || !find("labels") || !find("categories") || !find("splits")) return false;
    let expanded = false;
    function element(tag, className, text) {
      const node = doc.createElement(tag);
      if (className) node.setAttribute("class", className);
      if (text !== undefined) node.textContent = text;
      return node;
    }
    function sharedMax(rows) {
      return Math.max(1, ...rows.flatMap(function (row) { return splits.map(function (split) { return row[split]; }); }));
    }
    function chartRow(row, maximum, showCategory) {
      const item = element("li", "count-chart-row");
      const label = element("div", "count-chart-label");
      label.append(element("strong", "", row.name));
      if (showCategory) label.append(element("small", "", row.category));
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
    function setText(name, value) { const node = find(name); if (node) node.textContent = value; }
    function currentData() { return snapshot.datasets.find(function (data) { return data.id === controls.source.value; }) || snapshot.datasets[0]; }
    function renderLabels() {
      const data = currentData();
      const rows = queryLabels(data.labels, { search: controls.search.value, category: controls.category.value, sort: controls.sort.value });
      const shown = expanded ? rows : rows.slice(0, 20);
      const maximum = sharedMax(data.labels);
      find("labels").replaceChildren(...shown.map(function (row) { return chartRow(row, maximum, true); }));
      if (status) status.textContent = rows.length ? "Showing " + number(shown.length) + " of " + number(rows.length) + " label-category records." : "No matching label-category records. Try another search or category.";
      controls.more.hidden = rows.length <= 20;
      controls.more.textContent = expanded ? "Show first 20 records" : "Show all " + number(rows.length) + " records";
      controls.more.setAttribute("aria-expanded", String(expanded));
    }
    function renderDataset() {
      const data = currentData();
      controls.source.value = data.id;
      setText("title", data.label);
      setText("total", number(data.total));
      setText("label-count", number(data.unique_labels));
      setText("category-count", number(data.categories.length));
      setText("revision", data.revision);
      const repository = find("repository");
      if (repository) { repository.setAttribute("href", "https://huggingface.co/datasets/" + data.repository + "/tree/" + data.revision); repository.textContent = data.repository; }
      const notes = find("notes");
      if (notes) notes.replaceChildren(...data.notes.map(function (note) { return element("li", "", note); }));
      const all = element("option", "", "All categories"); all.setAttribute("value", "all");
      const categories = data.categories.slice().sort(function (a, b) { return collator.compare(a.name, b.name); });
      controls.category.replaceChildren(all, ...categories.map(function (row) { const option = element("option", "", row.name); option.setAttribute("value", row.name); return option; }));
      controls.category.value = "all";
      const maximum = sharedMax(data.categories);
      find("categories").replaceChildren(...data.categories.slice().sort(function (a, b) { return b.total - a.total || collator.compare(a.name, b.name); }).map(function (row) { return chartRow(row, maximum, false); }));
      find("splits").replaceChildren(...splits.map(function (split) {
        const item = element("li", "count-overview-row");
        const percent = data.total ? 100 * data.splits[split] / data.total : 0;
        const track = element("span", "count-track"); track.setAttribute("aria-hidden", "true");
        const fill = element("span", "count-fill split-" + split); fill.style.width = percent + "%"; track.append(fill);
        const value = element("span", "count-overview-value", number(data.splits[split]) + " ");
        value.append(element("small", "", "(" + percent.toFixed(1) + "%)"));
        const coveredLabels = new Set(data.labels.filter(function (row) { return row[split] > 0; }).map(function (row) { return row.name; })).size;
        item.append(element("strong", "", splitNames[split]), value, track, element("span", "count-coverage", number(coveredLabels) + " of " + number(data.unique_labels) + " sign labels"));
        return item;
      }));
      renderLabels();
    }
    controls.source.addEventListener("change", function () { expanded = false; renderDataset(); });
    controls.search.addEventListener("input", function () { expanded = false; renderLabels(); });
    controls.sort.addEventListener("change", function () { expanded = false; renderLabels(); });
    controls.category.addEventListener("change", function () { expanded = false; renderLabels(); });
    controls.more.addEventListener("click", function () { expanded = !expanded; renderLabels(); });
    renderDataset();
    Object.values(controls).forEach(function (control) { control.disabled = false; });
    return true;
  }

  return { validateSnapshot: validateSnapshot, queryLabels: queryLabels, initialise: initialise };
});
