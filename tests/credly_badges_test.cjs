const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeBadges, loadBadges, refreshGallery } = require('../assets/js/credly-badges.js');

const badge = {
  name: 'A learning badge', issuer: 'Google Cloud',
  url: 'https://www.credly.com/badges/a690cc3e-22ea-4853-b6b7-f2b76a20d8a6',
  image: '/assets/badges/gcp-associate-cloud-engineer.png', issued: '',
};

test('normalizes real credential IDs and image paths, without inventing missing dates', () => {
  const records = normalizeBadges([badge, { ...badge, uuid: 'an-image-id' }]);
  assert.equal(records.length, 1);
  assert.equal(records[0].image, 'https://spsarolkar.github.io/assets/badges/gcp-associate-cloud-engineer.png');
  assert.equal(records[0].issued, '');
});

test('rejects empty or malformed feeds and unsafe credential/image URLs', () => {
  for (const payload of [[], {}, [null], [{ ...badge, name: '' }], [{ ...badge, url: 'javascript:alert(1)' }], [{ ...badge, image: 'https://unexpected.example/badge.png' }]]) {
    assert.throws(() => normalizeBadges(payload));
  }
});

test('reads the maintained feed without browser cache and rejects HTTP or JSON failures', async () => {
  const fetcher = async (url, options) => {
    assert.equal(url, 'https://raw.githubusercontent.com/spsarolkar/spsarolkar.github.io/master/_data/credly_badges.json');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.credentials, 'omit');
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => [badge] };
  };
  assert.equal((await loadBadges(fetcher)).length, 1);
  await assert.rejects(loadBadges(async () => ({ ok: false })), /unavailable/);
  await assert.rejects(loadBadges(async () => ({ ok: true, json: async () => [] })), /Empty/);
});

class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.textContent = ''; }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(...children) { this.children.push(...children); }
  replaceChildren(fragment) { this.children = fragment.children; }
}
const doc = { createElement: tag => new Element(tag), createDocumentFragment: () => new Element('fragment') };
function gallery(limit = 0) {
  const elements = Object.fromEntries(['grid', 'count', 'status', 'all-link'].map(key => [`[data-credly-${key}]`, new Element(key)]));
  elements['[data-credly-grid]'].children = ['saved badge'];
  return { elements, getAttribute: () => String(limit), querySelector: name => elements[name] };
}

test('live data replaces the saved gallery and updates the full count while limiting a homepage preview', async () => {
  const target = gallery(1);
  const second = { ...badge, name: '<b>A second badge</b>', url: 'https://www.credly.com/badges/792e3fc3-dd5c-4f62-b6fa-3bdc9f7e8bf7' };
  await refreshGallery(target, Promise.resolve(normalizeBadges([second, badge])), doc);
  assert.equal(target.elements['[data-credly-grid]'].children.length, 1);
  assert.equal(target.elements['[data-credly-count]'].textContent, '2');
  assert.equal(target.elements['[data-credly-all-link]'].textContent, 'View all 2 badges');
  const card = target.elements['[data-credly-grid]'].children[0];
  assert.equal(card.children[0].children[1].textContent, '<b>A second badge</b>');
});

test('network or invalid-feed failure preserves the saved visible badges', async () => {
  const target = gallery();
  await refreshGallery(target, Promise.reject(new Error('offline')), doc);
  assert.deepEqual(target.elements['[data-credly-grid]'].children, ['saved badge']);
  assert.match(target.elements['[data-credly-status]'].textContent, /saved badge/);
});
