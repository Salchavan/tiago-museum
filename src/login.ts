// Entrypoint del login (Vite).
// - Importa Tailwind para que Vite lo bundlee también en login.html.
// - Login demo: no valida credenciales; solo redirige al panel admin.
import './tailwindcss.css';

// Registra el handler del formulario de login.
// Se usa una función separada para poder esperar al DOM cuando hace falta.
const setupLogin = (): void => {
  const form = document.getElementById('login-form') as HTMLFormElement | null;
  if (!form) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // Respetar BASE_URL (en GH Pages el sitio vive bajo /<repo>/).
    window.location.href = `${import.meta.env.BASE_URL}index-admin.html`;
  });
};

// Ejecutar cuando el DOM esté listo (por compatibilidad).
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLogin);
} else {
  setupLogin();
}
