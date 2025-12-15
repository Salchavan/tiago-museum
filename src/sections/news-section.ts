/**
 * Estructura de una noticia consumida por la sección.
 *
 * Se carga desde public/data/n.json (en build queda como dist/data/n.json).
 */
type NewsItem = {
  date: string;
  type: string;
  title: string;
  description: string;
  image: string;
  link: string;
};

/**
 * Sección “Noticias” (home): busca el contenedor y lo llena con tarjetas.
 *
 * Requisito en el HTML:
 * - Contenedor: #news-cards
 */
const setupNewsSection = (): void => {
  const container = document.getElementById('news-cards');
  if (!container) {
    return;
  }

  loadNewsCards(container);
};

const loadNewsCards = async (container: HTMLElement): Promise<void> => {
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

    const items = (await response.json()) as NewsItem[];

    // Estado vacío.
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `
        <div class="text-gray-500 text-sm col-span-full text-center py-8">
          No hay noticias disponibles en este momento.
        </div>
      `;
      return;
    }

    // Orden descendente por fecha (más nuevo primero).
    const sorted = [...items].sort((a, b) => {
      const da = parseMmDdYyyy(a.date)?.getTime() ?? -Infinity;
      const db = parseMmDdYyyy(b.date)?.getTime() ?? -Infinity;
      return db - da;
    });

    // Solo mostramos las 3 noticias más recientes en esta sección.
    const topThree = sorted.slice(0, 3);

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (const item of topThree) {
      fragment.appendChild(createNewsCard(item));
    }
    container.appendChild(fragment);
  } catch (error) {
    console.error('Error al cargar noticias de la sección:', error);
    // Estado de error.
    container.innerHTML = `
      <div class="text-red-600 text-sm col-span-full text-center py-8">
        No se pudieron cargar las noticias.
      </div>
    `;
  }
};

const createNewsCard = (item: NewsItem): HTMLElement => {
  // Construimos el DOM con createElement para evitar interpolación HTML.
  const card = document.createElement('article');
  card.className = 'bg-white rounded-lg overflow-hidden shadow-lg news-card';

  const img = document.createElement('img');
  img.src = item.image;
  img.alt = item.title;
  img.className = 'h-48 w-full object-cover';

  const body = document.createElement('div');
  body.className = 'p-6';

  const meta = document.createElement('div');
  meta.className = 'flex justify-between items-center mb-4';

  const type = document.createElement('span');
  type.className = 'text-sm font-semibold gold-text';
  type.textContent = item.type;

  const date = document.createElement('span');
  date.className = 'text-gray-500 text-sm';
  date.textContent = item.date;

  meta.appendChild(type);
  meta.appendChild(date);

  const title = document.createElement('h3');
  title.className = 'text-xl font-bold mb-4';
  title.textContent = item.title;

  const description = document.createElement('p');
  description.className = 'text-gray-700 mb-4';
  description.textContent = item.description;

  const link = document.createElement('a');
  link.className = 'gold-text font-semibold hover:underline';
  link.textContent = 'Saber mas';
  // Fallback defensivo por si el JSON no incluye link.
  link.href = item.link || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  body.appendChild(meta);
  body.appendChild(title);
  body.appendChild(description);
  body.appendChild(link);

  card.appendChild(img);
  card.appendChild(body);

  return card;
};

function parseMmDdYyyy(value: string): Date | null {
  // Parseo tolerante:
  // - preferimos MM/DD/YYYY (formato de los JSON actuales)
  // - si no matchea, probamos Date(value) como fallback
  const match = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.exec(value.trim());
  if (!match) {
    const fallback = new Date(value);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, mm, dd, yyyy] = match;
  const month = Number(mm);
  const day = Number(dd);
  const year = Number(yyyy);

  if (
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(year)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? null : date;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupNewsSection);
} else {
  setupNewsSection();
}
