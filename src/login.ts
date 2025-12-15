import './tailwindcss.css';

const setupLogin = (): void => {
  const form = document.getElementById('login-form') as HTMLFormElement | null;
  if (!form) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.href = `${import.meta.env.BASE_URL}index-admin.html`;
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLogin);
} else {
  setupLogin();
}
