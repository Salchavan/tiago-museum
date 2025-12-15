/**
 * Estructura mínima de noticia consumida por el modal.
 *
 * Se carga desde public/data/n.json (en build queda como dist/data/n.json).
 */
interface NewsItem {
  date: string;
  type: string;
  title: string;
  description: string;
  link?: string;
}

/**
 * Modal “Ver todas las noticias”.
 *
 * Requisitos en el HTML:
 * - Botón: #open-news-modal
 * - Modal overlay: #news-modal
 * - Botón cerrar: [data-modal-close]
 * - Contenedor listado: #news-modal-list
 */
const setupNewsModal = (): void => {
  const openButton = document.getElementById('open-news-modal');
  const modal = document.getElementById('news-modal');
  const closeButton = modal?.querySelector(
    '[data-modal-close]'
  ) as HTMLButtonElement | null;
  const newsListContainer = modal?.querySelector(
    '#news-modal-list'
  ) as HTMLElement | null;

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

  if (newsListContainer) {
    // Se carga una vez al inicializar. Si querés refrescar, podés re-llamar acá.
    loadNewsEntries(newsListContainer);
  }
};

const loadNewsEntries = async (container: HTMLElement): Promise<void> => {
  // Estado de carga.
  container.innerHTML = `
    <div class="text-gray-500 text-sm col-span-full">
      Cargando noticias...
    </div>
  `;

  try {
    // Respeta BASE_URL para GitHub Pages (project-site).
    const response = await fetch(`${import.meta.env.BASE_URL}data/n.json`);
    if (!response.ok) {
      throw new Error('No se pudo obtener la lista de noticias');
    }

    const newsItems = (await response.json()) as NewsItem[];

    if (!newsItems.length) {
      container.innerHTML = `
        <div class="text-gray-500 text-sm col-span-full text-center py-8">
          No hay noticias disponibles en este momento.
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    newsItems.forEach((item) => {
      fragment.appendChild(createNewsCard(item));
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  } catch (error) {
    console.error('Error al cargar las noticias:', error);
    container.innerHTML = `
      <div class="text-red-600 text-sm col-span-full text-center py-8">
        No se pudieron cargar las noticias. Inténtalo nuevamente más tarde.
      </div>
    `;
  }
};

const createNewsCard = (item: NewsItem): HTMLElement => {
  // Crea una tarjeta simple con “Ver detalle”.
  const card = document.createElement('article');
  card.className =
    'bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-3';

  // Formateo defensivo: si no parsea, mostramos el string original.
  const parsedDate = new Date(item.date);
  const formattedDate = isNaN(parsedDate.getTime())
    ? item.date
    : parsedDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  card.innerHTML = `
    <div class="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
      <span class="font-semibold text-black/70">${item.type}</span>
      <span>${formattedDate}</span>
    </div>
    <h4 class="text-lg font-semibold leading-snug">${item.title}</h4>
    <p class="text-sm text-gray-600 flex-1">${item.description}</p>
    <a class="text-sm font-semibold gold-text hover:underline inline-flex items-center gap-2 mt-auto">
      <span>Ver detalle</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </a>
  `;

  const link = card.querySelector('a');
  if (link) {
    // Si no hay link, queda como #.
    link.setAttribute('href', item.link || '#');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }

  return card;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupNewsModal);
} else {
  setupNewsModal();
}
