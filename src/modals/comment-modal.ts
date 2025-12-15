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

    if (!form.checkValidity()) {
      setStatus('Completa todos los campos para enviar el comentario.');
      return;
    }

    setStatus(null);
    form.reset();
    toggleModal(false);
  });

  form?.addEventListener('input', () => {
    setStatus(null);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCommentModal);
} else {
  setupCommentModal();
}
