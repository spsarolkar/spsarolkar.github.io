const assert = require('node:assert/strict');
const test = require('node:test');
const { validateSnapshot, queryLabels, initialise } = require('../assets/js/sign-language-counts.js');

function snapshot() {
  const rows = [
    { name: 'Clock', category: 'Time', train: 4, validation: 1, test: 1, total: 6 },
    { name: 'Clock', category: 'Objects', train: 2, validation: 0, test: 0, total: 2 },
    { name: 'Hello', category: 'Greetings', train: 3, validation: 1, test: 0, total: 4 },
    { name: 'Thanks', category: 'Greetings', train: 1, validation: 0, test: 1, total: 2 },
  ];
  return {
    checked_on: '2026-11-27',
    datasets: [{
      id: 'public-videos', label: 'Aligned INCLUDE v2 videos',
      repository: 'spsarolkar/AI4Bharat-INCLUDE-dataset',
      revision: 'a'.repeat(40), total: 14, unique_labels: 3,
      splits: { train: 10, validation: 2, test: 2 },
      split_label_coverage: { train: 3, validation: 2, test: 2 },
      categories: [
        { name: 'Time', train: 4, validation: 1, test: 1, total: 6 },
        { name: 'Objects', train: 2, validation: 0, test: 0, total: 2 },
        { name: 'Greetings', train: 4, validation: 1, test: 1, total: 6 },
      ],
      labels: rows.map((row) => ({ ...row })), notes: ['Metadata counts; not an accuracy measurement.'],
      signs: [
        { name: 'Clock', categories: ['Objects', 'Time'], train: 6, validation: 1, test: 1, total: 8 },
        { name: 'Hello', categories: ['Greetings'], train: 3, validation: 1, test: 0, total: 4 },
        { name: 'Thanks', categories: ['Greetings'], train: 1, validation: 0, test: 1, total: 2 },
      ],
    }],
    demo: {},
  };
}

test('validates reconciled inventories, preserving exact zero counts and repeated words across categories', () => {
  const data = snapshot();
  assert.equal(validateSnapshot(data), data);
  assert.equal(data.datasets[0].labels[1].validation, 0);
});

test('rejects incomplete, duplicate, malformed or unreconciled count snapshots', () => {
  const mutations = [
    (d) => { d.datasets[0].labels[0].train = 1.5; },
    (d) => { d.datasets[0].labels[0].test = -1; },
    (d) => { delete d.datasets[0].labels[0].validation; },
    (d) => { delete d.datasets[0].splits.test; },
    (d) => { d.datasets[0].labels.push({ ...d.datasets[0].labels[0] }); },
    (d) => { d.datasets[0].categories.push({ ...d.datasets[0].categories[0] }); },
    (d) => { d.datasets[0].labels[0].total++; },
    (d) => { d.datasets[0].splits.train++; },
    (d) => { d.datasets[0].categories[0].total++; },
    (d) => { d.datasets[0].categories[0].train++; d.datasets[0].categories[0].total++; },
    (d) => { d.datasets[0].total++; },
    (d) => { d.datasets[0].unique_labels = 4; },
    (d) => { d.datasets[0].revision = 'main'; },
    (d) => { d.datasets[0].repository = 'https://evil.example/datasets/spsarolkar/test'; },
    (d) => { d.datasets[0].repository = 'https://huggingface.co/datasets/other/test'; },
    (d) => { d.datasets[0].id = 'other'; },
    (d) => { d.datasets.push({ ...d.datasets[0] }); },
    (d) => { d.datasets.pop(); },
    (d) => { d.datasets[0].notes = [7]; },
    (d) => { d.datasets[0].signs[0].categories.pop(); },
    (d) => { d.datasets[0].signs[0].categories = ['Objects', 'Objects']; },
    (d) => { d.datasets[0].signs[0].test = 0; },
    (d) => { d.datasets[0].signs[1] = { ...d.datasets[0].signs[0] }; },
    (d) => { d.datasets[0].split_label_coverage.test = 3; },
  ];
  mutations.forEach((mutate, index) => {
    const data = snapshot(); mutate(data);
    assert.throws(() => validateSnapshot(data), undefined, 'mutation ' + index);
  });
});

test('queries case-insensitive names and categories, sorts deterministically and preserves source order', () => {
  const rows = snapshot().datasets[0].labels;
  const original = JSON.stringify(rows);
  assert.deepEqual(queryLabels(rows, {}).map((row) => row.total), [6, 4, 2, 2]);
  assert.deepEqual(queryLabels(rows, { sort: 'fewest' }).map((row) => row.name), ['Clock', 'Thanks', 'Hello', 'Clock']);
  assert.deepEqual(queryLabels(rows, { sort: 'name' }).map((row) => row.category), ['Objects', 'Time', 'Greetings', 'Greetings']);
  assert.deepEqual(queryLabels(rows, { sort: 'train' }).map((row) => row.train), [1, 2, 3, 4]);
  assert.equal(queryLabels(rows, { search: ' cLoCk ' }).length, 2);
  assert.equal(queryLabels(rows, { search: 'greetings' }).length, 2);
  assert.equal(queryLabels(rows, { category: 'Objects' })[0].test, 0);
  assert.equal(queryLabels(rows, { category: 'Missing' }).length, 0);
  assert.notEqual(queryLabels(rows, {}), rows);
  assert.equal(JSON.stringify(rows), original);
});

class Element {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.attrs = {}; this.style = {}; this.listeners = {}; this.textContent = ''; this.value = ''; this.disabled = true; this.hidden = false; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(event, fn) { this.listeners[event] = fn; }
  dispatch(event) { this.listeners[event]?.({ target: this }); }
}

function fixture(data) {
  const selectors = ['json', 'search', 'sort', 'category', 'more', 'results', 'labels'];
  const nodes = Object.fromEntries(selectors.map((name) => [name, new Element()]));
  nodes.json.textContent = typeof data === 'string' ? data : JSON.stringify(data);
  nodes.sort.value = 'most';
  nodes.labels.append(new Element('saved'));
  const root = { querySelector: (selector) => nodes[selector.match(/data-sign-counts-([^\]]+)/)?.[1]] || null };
  const doc = { createElement: (name) => new Element(name) };
  return { root, doc, nodes };
}

function descendants(node) { return [node, ...node.children.flatMap(descendants)]; }

test('enhances verified data with accessible exact counts and fixed scales through search', () => {
  const { root, doc, nodes } = fixture(snapshot());
  assert.equal(initialise(root, doc), true);
  assert.equal(nodes.search.disabled, false);
  assert.equal(nodes.labels.children.length, 3);
  nodes.search.value = 'Hello'; nodes.search.dispatch('input');
  assert.equal(nodes.labels.children.length, 1);
  const fills = descendants(nodes.labels).filter((node) => (node.attrs.class || '').includes('count-fill'));
  assert.deepEqual(fills.map((node) => node.style.width), ['50%', (100 / 6) + '%', '0%']);
  assert.match(nodes.results.textContent, /1/);
});

test('invalid JSON and counts preserve saved markup and leave controls disabled', () => {
  const invalid = snapshot(); invalid.datasets[0].total = 0;
  for (const payload of ['not json', invalid]) {
    const { root, doc, nodes } = fixture(payload);
    const saved = nodes.labels.children[0];
    assert.equal(initialise(root, doc), false);
    assert.equal(nodes.labels.children[0], saved);
    assert.equal(nodes.search.disabled, true);
    assert.match(nodes.results.textContent, /saved|unavailable/i);
  }
});

test('expands the first twenty signs and resets pagination on filters', () => {
  const data = snapshot();
  data.datasets[0].labels = Array.from({ length: 25 }, (_, index) => ({ name: 'Sign ' + String(index).padStart(2, '0'), category: 'Words', train: 1, validation: 0, test: 1, total: 2 }));
  Object.assign(data.datasets[0], {
    total: 50, unique_labels: 25, splits: { train: 25, validation: 0, test: 25 },
    split_label_coverage: { train: 25, validation: 0, test: 25 },
    signs: data.datasets[0].labels.map(({ category, ...row }) => ({ ...row, categories: [category] })),
    categories: [{ name: 'Words', train: 25, validation: 0, test: 25, total: 50 }],
  });
  const { root, doc, nodes } = fixture(data);
  assert.equal(initialise(root, doc), true);
  assert.equal(nodes.labels.children.length, 20);
  assert.equal(nodes.more.hidden, false);
  nodes.more.dispatch('click');
  assert.equal(nodes.labels.children.length, 25);
  assert.equal(nodes.more.attrs['aria-expanded'], 'true');
  nodes.search.value = 'Sign 01'; nodes.search.dispatch('input');
  assert.equal(nodes.labels.children.length, 1);
  assert.equal(nodes.more.hidden, true);
  nodes.search.value = ''; nodes.search.dispatch('input');
  assert.equal(nodes.labels.children.length, 20);
});

test('combines categories in the sign view and explains test coverage in a category with zero tests', () => {
  const { root, doc, nodes } = fixture(snapshot());
  assert.equal(initialise(root, doc), true);
  nodes.search.value = 'Clock'; nodes.search.dispatch('input');
  assert.equal(nodes.labels.children.length, 1);
  const counts = () => descendants(nodes.labels).filter((node) => node.attrs.class === 'count-value').map((node) => node.textContent);
  assert.deepEqual(counts(), ['6', '1', '1']);
  nodes.category.value = 'Objects'; nodes.category.dispatch('change');
  assert.deepEqual(counts(), ['2', '0', '0']);
  assert.ok(descendants(nodes.labels).some((node) => node.textContent === '1 test clip across all categories'));
  nodes.category.value = ''; nodes.category.dispatch('change');
  assert.deepEqual(counts(), ['6', '1', '1']);
});

test('treats sign labels as literal text, never source markup', () => {
  const data = snapshot();
  const literal = '<img src=x onerror=alert(1)>';
  data.datasets[0].labels[2].name = literal;
  data.datasets[0].signs[1].name = literal;
  const { root, doc, nodes } = fixture(data);
  assert.equal(initialise(root, doc), true);
  assert.ok(descendants(nodes.labels).some((node) => node.textContent === literal && !node.children.length));
  assert.equal(descendants(nodes.labels).some((node) => Object.hasOwn(node, 'innerHTML')), false);
});
