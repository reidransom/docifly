(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const picker = document.getElementById('language-picker');
    const header = document.querySelector('header');
    const nav = document.getElementById('site-nav');
    if (!picker || !header || !nav) return;

    const desktop = matchMedia('(min-width: 50rem)');
    const placePicker = () => {
      const summary = picker.querySelector('summary');
      const focused = document.activeElement === summary;
      if (desktop.matches) {
        header.insertBefore(picker, document.getElementById('mode-picker'));
        if (focused) summary?.focus();
      } else {
        nav.append(picker);
        if (focused) document.getElementById('menu-toggle')?.focus();
      }
    };

    placePicker();
    desktop.addEventListener('change', placePicker);
  });
})();
