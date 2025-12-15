// Entrypoint principal (Vite).
// - Importa Tailwind para que Vite lo bundlee en el build.
// - Registra comportamientos globales del sitio (atajos, scroll, etc.).
import './tailwindcss.css';

document.addEventListener('DOMContentLoaded', () => {
  const backToTopButton = document.getElementById('backToTop');

  // Atajo: Ctrl + K
  // Navega al login respetando BASE_URL (en GH Pages el sitio vive bajo /<repo>/).
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      window.location.href = `${import.meta.env.BASE_URL}login.html`;
    }
  });

  // Botón "volver arriba" (aparece después de scrollear).
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.remove('hidden');
      } else {
        backToTopButton.classList.add('hidden');
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth scroll para anchors internos (links que empiezan con #).
  // Ajusta un offset para compensar el header (si corresponde).
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    .forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        event.preventDefault();

        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') {
          return;
        }

        const targetElement = document.querySelector<HTMLElement>(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth',
          });
        }
      });
    });

  // Menú mobile: placeholder (demo).
  // Nota: hoy solo muestra un alert; no hay implementación real de menú.
  const mobileMenuButton =
    document.querySelector<HTMLButtonElement>('button.md\\:hidden');

  mobileMenuButton?.addEventListener('click', () => {
    alert(
      'Mobile menu would open here. In a real implementation, this would show/hide a menu.'
    );
  });
});
