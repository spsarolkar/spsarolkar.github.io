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
    datasets: ['apple-vision', 'public-videos'].map((id) => ({
      id, label: id === 'apple-vision' ? 'Apple Vision keypoints' : 'Public video mirror',
      repository: id === 'apple-vision' ? 'spsarolkar/AI4Bharat-INCLUDE-keypoints' : 'spsarolkar/AI4Bharat-INCLUDE-dataset',
      revision: 'a'.repeat(40), total: 14, unique_labels: 3,
      splits: { train: 10, validation: 2, test: 2 },
      categories: [
        { name: 'Time', train: 4, validation: 1, test: 1, total: 6 },
        { name: 'Objects', train: 2, validation: 0, test: 0, total: 2 },
        { name: 'Greetings', train: 4, validation: 1, test: 1, total: 6 },
      ],
      labels: rows.map((row) => ({ ...row })), notes: ['Metadata counts; not an accuracy measurement.'],
    })),
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
    (d) => { d.datasets[1].id = d.datasets[0].id; },
    (d) => { d.datasets.pop(); },
    (d) => { d.datasets[0].notes = [7]; },
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
  const selectors = ['json', 'source', 'search', 'sort', 'category', 'more', 'results', 'labels', 'categories', 'splits', 'total', 'label-count', 'category-count', 'title', 'notes', 'revision', 'repository'];
  const nodes = Object.fromEntries(selectors.map((name) => [name, new Element()]));
  nodes.json.textContent = typeof data === 'string' ? data : JSON.stringify(data);
  nodes.source.value = 'apple-vision'; nodes.sort.value = 'most'; nodes.category.value = 'all';
  nodes.labels.append(new Element('saved'));
  const root = { querySelector: (selector) => nodes[selector.match(/data-sign-counts-([^\]]+)/)?.[1]] || null };
  const doc = { createElement: (name) => new Element(name) };
  return { root, doc, nodes };
}

function descendants(node) { return [node, ...node.children.flatMap(descendants)]; }

test('enhances verified data with accessible exact counts and fixed scales through search', () => {
  const { root, doc, nodes } = fixture(snapshot());
  assert.equal(initialise(root, doc), true);
  assert.equal(nodes.source.disabled, false);
  assert.equal(nodes.labels.children.length, 4);
  assert.equal(nodes.categories.children.length, 3);
  assert.equal(nodes.splits.children.length, 3);
  const coverage = descendants(nodes.splits).filter((node) => node.attrs.class === 'count-coverage');
  assert.deepEqual(coverage.map((node) => node.textContent), ['3 of 3 sign labels', '2 of 3 sign labels', '2 of 3 sign labels']);
  assert.equal(nodes.total.textContent, '14');
  assert.equal(nodes['label-count'].textContent, '3');
  assert.equal(nodes.repository.attrs.href, 'https://huggingface.co/datasets/spsarolkar/AI4Bharat-INCLUDE-keypoints/tree/' + 'a'.repeat(40));
  nodes.search.value = 'Hello'; nodes.search.dispatch('input');
  assert.equal(nodes.labels.children.length, 1);
  const fills = descendants(nodes.labels).filter((node) => (node.attrs.class || '').includes('count-fill'));
  assert.deepEqual(fills.map((node) => node.style.width), ['75%', '25%', '0%']);
  assert.match(nodes.results.textContent, /1/);
});

test('invalid JSON and counts preserve saved markup and leave controls disabled', () => {
  const invalid = snapshot(); invalid.datasets[0].total = 0;
  for (const payload of ['not json', invalid]) {
    const { root, doc, nodes } = fixture(payload);
    const saved = nodes.labels.children[0];
    assert.equal(initialise(root, doc), false);
    assert.equal(nodes.labels.children[0], saved);
    assert.equal(nodes.source.disabled, true);
    assert.match(nodes.results.textContent, /saved|unavailable/i);
  }
});

test('expands the first twenty records, resets pagination on filters and updates source provenance', () => {
  const data = snapshot();
  data.datasets[0].labels = Array.from({ length: 25 }, (_, index) => ({ name: 'Sign ' + String(index).padStart(2, '0'), category: 'Words', train: 1, validation: 0, test: 1, total: 2 }));
  Object.assign(data.datasets[0], {
    total: 50, unique_labels: 25, splits: { train: 25, validation: 0, test: 25 },
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
  nodes.source.value = 'public-videos'; nodes.source.dispatch('change');
  assert.equal(nodes.labels.children.length, 4);
  assert.equal(nodes.total.textContent, '14');
  assert.equal(nodes.title.textContent, 'Public video mirror');
  assert.equal(nodes.repository.attrs.href, 'https://huggingface.co/datasets/spsarolkar/AI4Bharat-INCLUDE-dataset/tree/' + 'a'.repeat(40));
  assert.equal(nodes.more.hidden, true);
});

test('treats source labels and notes as literal text, never source markup', () => {
  const data = snapshot();
  data.datasets[0].notes = ['<img src=x onerror=alert(1)>'];
  const { root, doc, nodes } = fixture(data);
  assert.equal(initialise(root, doc), true);
  assert.equal(nodes.notes.children[0].textContent, data.datasets[0].notes[0]);
  assert.equal(nodes.notes.children[0].children.length, 0);
  assert.equal(descendants(nodes.labels).some((node) => Object.hasOwn(node, 'innerHTML')), false);
});
