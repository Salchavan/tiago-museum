const setupCommentModal = (): void => {
  const openButton = document.getElementById('open-comment-modal');
  const modal = document.getElementById('comment-modal');
  const closeButton = modal?.querySelector(
    '[data-modal-close]'
  ) as HTMLButtonElement | null;

  if (!openButton || !modal) {
    return;
  }

  const toggleModal = (show: boolean): void => {
    if (show) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    } else {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
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
    form.reset();
    toggleModal(false);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCommentModal);
} else {
  setupCommentModal();
}
