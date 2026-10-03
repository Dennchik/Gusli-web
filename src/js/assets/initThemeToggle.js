//* ─────────────────────────────────────────────────────────────────
//* Переключатель темы: светлая / тёмная с сохранением в localStorage
//* Переключатель темы кнопкой с обновлением частиц canvas
//* ─────────────────────────────────────────────────────────────────
export function initThemeToggle(onThemeChange) {
   const themeBtn = document.getElementById('tmpl3-theme-toggle');
   if (!themeBtn) return;

   const savedTheme = localStorage.getItem('theme');
   const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
   ).matches;

   const isDarkInitial =
      savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

   if (isDarkInitial) {
      document.body.classList.add('dark-theme');
   } else {
      document.body.classList.remove('dark-theme');
   }

   // Вызываем callback при загрузке
   if (typeof onThemeChange === 'function') {
      onThemeChange(isDarkInitial);
   }

   themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');

      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      // Вызываем callback при клике
      if (typeof onThemeChange === 'function') {
         onThemeChange(isDark);
      }
   });
}
