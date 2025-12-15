/**
 * Modal “Donaciones”.
 *
 * Requisitos en el HTML:
 * - Botón: #open-donation-modal
 * - Modal overlay: #donation-modal
 * - Botón cerrar: [data-modal-close]
 */
const setupDonationModal = (): void => {
  const openButton = document.getElementById('open-donation-modal');
  const modal = document.getElementById('donation-modal');
  const closeButton = modal?.querySelector(
    '[data-modal-close]'
  ) as HTMLButtonElement | null;

  if (!openButton || !modal) {
    return;
  }

  // Abre/cierra el modal y bloquea el scroll del body.
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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDonationModal);
} else {
  setupDonationModal();
}
