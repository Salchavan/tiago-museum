/**
 * Modal “Dejar comentario”.
 *
 * Requisitos en el HTML:
 * - Botón: #open-comment-modal
 * - Modal overlay: #comment-modal
 * - Botón cerrar: [data-modal-close]
 * - Form: #comment-form
 * - Estado/errores: #comment-status
 *
 * Importante: actualmente no persiste nada (no escribe JSON ni llama a API).
 * Solo valida, muestra mensaje y cierra.
 */
const setupCommentModal = (): void => {
  const openButton = document.getElementById('open-comment-modal');
  const modal = document.getElementById('comment-modal');
  const closeButton = modal?.querySelector(
    '[data-modal-close]'
  ) as HTMLButtonElement | null;
  const statusEl = modal?.querySelector(
    '#comment-status'
  ) as HTMLElement | null;

  if (!openButton || !modal) {
    return;
  }

  // Muestra/oculta el texto de estado (validación).
  const setStatus = (message: string | null): void => {
    if (!statusEl) {
      return;
    }

    if (!message) {
      statusEl.textContent = '';
      statusEl.classList.add('hidden');
      return;
    }

    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
  };

  // Abre/cierra el modal y bloquea scroll del body.
  const toggleModal = (show: boolean): void => {
    if (show) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      setStatus(null);
    } else {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      setStatus(null);
    }
  };

  openButton.addEventListener('click', () => toggleModal(true));
  closeButton?.addEventListener('click', () => toggleModal(false));

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      toggleModal(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      toggleModal(false);
    }
  });

  const form = modal.querySelector('#comment-form') as HTMLFormElement | null;
  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    // Usamos la validación nativa del navegador (required, etc.).
    if (!form.checkValidity()) {
      setStatus('Completa todos los campos para enviar el comentario.');
      return;
    }

    setStatus(null);
    form.reset();
    toggleModal(false);
  });

  form?.addEventListener('input', () => {
    // Cuando el usuario corrige los campos, ocultamos el error.
    setStatus(null);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCommentModal);
} else {
  setupCommentModal();
}
