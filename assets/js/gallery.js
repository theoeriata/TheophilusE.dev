(() => {
  if (!window.HTMLDialogElement) return;
  const galleries = document.querySelectorAll('[data-gallery]');
  if (!galleries.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'gallery-dialog';
  dialog.setAttribute('aria-label', 'Image viewer');
  const toolbar = document.createElement('div');
  toolbar.className = 'gallery-toolbar';
  const count = document.createElement('span');
  count.setAttribute('aria-live', 'polite');
  function button(label, text) {
    const element = document.createElement('button');
    element.type = 'button';
    element.setAttribute('aria-label', label);
    element.textContent = text;
    return element;
  }
  const previous = button('Previous image', '←');
  const next = button('Next image', '→');
  const close = button('Close image viewer', 'Close ×');
  const image = document.createElement('img');
  const caption = document.createElement('p');
  let links = [], current = 0, opener;
  function show(index) {
    current = (index + links.length) % links.length;
    const link = links[current];
    image.src = link.href;
    image.alt = link.dataset.caption;
    caption.textContent = link.dataset.caption;
    count.textContent = (current + 1) + ' / ' + links.length;
    previous.hidden = next.hidden = links.length < 2;
  }
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { image.removeAttribute('src'); opener?.focus(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  toolbar.append(count, previous, next, close);
  dialog.append(toolbar, image, caption);
  document.body.append(dialog);
  galleries.forEach(gallery => gallery.addEventListener('click', event => {
    const link = event.target.closest('a.gallery-image');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    opener = link;
    links = Array.from(gallery.querySelectorAll('a.gallery-image'));
    show(links.indexOf(link));
    dialog.showModal();
    close.focus();
  }));
})();
