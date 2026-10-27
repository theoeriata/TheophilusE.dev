(() => {
  'use strict';
  const form = document.getElementById('search-form');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const status = document.getElementById('search-status');
  let index = null;
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase();
  function search() {
    if (!index) return;
    const query = input.value.trim();
    const words = normalize(query).split(/\s+/).filter(Boolean);
    results.replaceChildren();
    if (!words.length) { status.textContent = 'Explore a subject, or search for a specific project.'; return; }
    const hits = index.map(page => {
      const title = normalize(page.title);
      const tags = normalize(page.tags.join(' '));
      const content = normalize(page.content);
      const matches = words.every(word => title.includes(word) || tags.includes(word) || content.includes(word));
      const score = words.reduce((total, word) => total + (title.includes(word) ? 10 : 0) + (tags.includes(word) ? 5 : 0), 0);
      return { page, matches, score };
    }).filter(hit => hit.matches).sort((a, b) => b.score - a.score);
    status.textContent = hits.length ? hits.length + (hits.length === 1 ? ' result' : ' results') + ' for “' + query + '”' : 'No results for “' + query + '”. Try a broader subject.';
    hits.forEach(({page}) => {
      const li = document.createElement('li');
      const kind = document.createElement('span');
      kind.className = 'section-label';
      kind.textContent = page.section === 'projects' ? 'Project' : page.section === 'blog' ? 'Writing' : 'Page';
      const heading = document.createElement('h2');
      const link = document.createElement('a');
      link.href = page.permalink;
      link.textContent = page.title;
      const summary = document.createElement('p');
      summary.textContent = page.summary;
      heading.append(link);
      li.append(kind, heading, summary);
      results.append(li);
    });
  }
  input.value = new URLSearchParams(location.search).get('q') || '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    const url = new URL(location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    search();
  });
  let timer;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 120); });
  fetch(form.dataset.index).then(response => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json();
  }).then(data => { index = data; search(); }).catch(() => {
    status.textContent = 'Search could not load. Please try again, or use the archive link below.';
  });
})();
