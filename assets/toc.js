(() => {
  const article = document.getElementById('article');
  const slot = document.getElementById('toc-slot');
  if (!article || !slot || slot.children.length) return;
  const headings = Array.from(article.querySelectorAll('h2[id], h3[id]')).filter(
    (el) => el.id && el.textContent.trim() && !el.closest('pre, code'),
  );
  if (!headings.length) return;
  const desktop = matchMedia('(min-width: 72rem)');
  const nav = document.createElement('nav');
  nav.id = 'toc';
  nav.setAttribute('aria-label', 'On this page');
  const title = document.createElement('h2');
  title.textContent = 'On this page';
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const label = document.createElement('span');
  label.className = 'toc-toggle';
  label.textContent = 'On this page';
  const caret = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  caret.setAttribute('class', 'caret');
  caret.setAttribute('viewBox', '0 0 24 24');
  caret.setAttribute('width', '16');
  caret.setAttribute('height', '16');
  caret.setAttribute('aria-hidden', 'true');
  const caretPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  caretPath.setAttribute('fill', 'currentColor');
  caretPath.setAttribute(
    'd',
    'm14.83 11.29-4.24-4.24a1 1 0 1 0-1.42 1.41L12.71 12l-3.54 3.54a1 1 0 0 0 0 1.41 1 1 0 0 0 .71.29 1 1 0 0 0 .71-.29l4.24-4.24a1.002 1.002 0 0 0 0-1.42Z',
  );
  caret.append(caretPath);
  label.append(caret);
  const currentLabel = document.createElement('span');
  currentLabel.className = 'toc-current';
  summary.append(label, currentLabel);
  const list = document.createElement('ul');
  const entries = [
    { id: 'main-content', text: 'Overview', depth: 0 },
    ...headings.map((heading) => ({
      id: heading.id,
      text: heading.textContent.trim(),
      depth: heading.tagName === 'H3' ? 1 : 0,
    })),
  ];
  const links = entries.map((entry) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + encodeURIComponent(entry.id);
    link.textContent = entry.text;
    link.style.setProperty('--depth', String(entry.depth));
    li.append(link);
    list.append(li);
    return link;
  });
  details.append(summary, list);
  nav.append(title, details);
  slot.append(nav);
  document.documentElement.dataset.hasToc = '';
  const resize = () => {
    const hadFocus = details.contains(document.activeElement);
    details.open = desktop.matches;
    if (!desktop.matches && hadFocus) summary.focus();
    if (desktop.matches && document.activeElement === summary) links[0].focus();
  };
  resize();
  desktop.addEventListener('change', resize);
  list.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    if (!desktop.matches) details.open = false;
    const target = document.getElementById(decodeURIComponent(event.target.hash.slice(1)));
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  });
  document.addEventListener('click', (event) => {
    if (!desktop.matches && event.target instanceof Node && !nav.contains(event.target)) {
      const hadFocus = details.contains(document.activeElement);
      details.open = false;
      if (hadFocus) summary.focus();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !desktop.matches && details.open) {
      const hadFocus = details.contains(document.activeElement);
      details.open = false;
      if (hadFocus) summary.focus();
    }
  });
  let positions = [];
  let active = -1;
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const threshold =
      scrollY + parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 1;
    let low = 0,
      high = positions.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (positions[middle] <= threshold) low = middle + 1;
      else high = middle;
    }
    let index = low;
    if (scrollY > 0 && innerHeight + scrollY >= document.documentElement.scrollHeight - 2)
      index = links.length - 1;
    if (index === active) return;
    if (active >= 0) links[active].removeAttribute('aria-current');
    active = index;
    links[index].setAttribute('aria-current', 'true');
    currentLabel.textContent = entries[index].text;
  };
  const measure = () => {
    positions = headings.map((heading) => heading.getBoundingClientRect().top + scrollY);
    update();
  };
  addEventListener(
    'scroll',
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener('resize', measure);
  new ResizeObserver(measure).observe(article);
  document.fonts.ready.then(measure);
  addEventListener('load', () => {
    if (location.hash) {
      let id;
      try {
        id = decodeURIComponent(location.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (target && article.contains(target)) target.scrollIntoView();
    }
    measure();
  });
  measure();
})();
