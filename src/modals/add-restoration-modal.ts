const setupAddRestorationModal = (): void => {
  const openButton = document.getElementById('open-add-restoration-modal');
  const modal = document.getElementById('add-restoration-modal');
  const closeButton = modal?.querySelector(
    '[data-modal-close]'
  ) as HTMLButtonElement | null;

  if (!openButton || !modal) {
    return;
  }

  const statusEl = modal.querySelector(
    '#add-restoration-status'
  ) as HTMLParagraphElement | null;

  const setStatus = (message: string, kind: 'error' | 'success' | 'info') => {
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message;
    statusEl.classList.remove(
      'text-red-600',
      'text-green-700',
      'text-gray-600'
    );

    if (kind === 'success') {
      statusEl.classList.add('text-green-700');
    } else if (kind === 'info') {
      statusEl.classList.add('text-gray-600');
    } else {
      statusEl.classList.add('text-red-600');
    }
  };

  const toggleModal = (show: boolean): void => {
    if (show) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      setStatus('', 'info');
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

  const form = modal.querySelector(
    '#add-restoration-form'
  ) as HTMLFormElement | null;

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement | null;

    const formData = new FormData(form);
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const image = String(formData.get('image') ?? '').trim();
    const dateStartedInput = String(formData.get('date_started') ?? '').trim();

    if (!title || !description || !image || !dateStartedInput) {
      setStatus('Completa todos los campos.', 'error');
      return;
    }

    const date_started = normalizeDateStarted(dateStartedInput);

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('opacity-60');
      }

      setStatus('Guardando...', 'info');

      const response = await fetch('/api/restorations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          image,
          date_started,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !payload?.success) {
        setStatus(
          payload?.message || 'No se pudo guardar la restauración.',
          'error'
        );
        return;
      }

      setStatus('Restauración guardada.', 'success');
      form.reset();
      toggleModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar la restauración:', error);
      setStatus(
        'No se pudo conectar al servidor. Ejecuta el proyecto con `npm run dev`.',
        'error'
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-60');
      }
    }
  });
};

function normalizeDateStarted(value: string): string {
  // If coming from <input type="date">, it will be YYYY-MM-DD.
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAddRestorationModal);
} else {
  setupAddRestorationModal();
}
