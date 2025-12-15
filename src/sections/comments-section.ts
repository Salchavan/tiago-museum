type CommentItem = {
  date: string;
  perfilicon: string;
  username: string;
  text: string;
};

const setupCommentsSection = (): void => {
  const container = document.getElementById('comments-cards');
  if (!container) {
    return;
  }

  loadCommentsCards(container);
};

const loadCommentsCards = async (container: HTMLElement): Promise<void> => {
  container.innerHTML = `
    <div class="text-gray-500 text-sm col-span-full">
      Cargando comentarios...
    </div>
  `;

  try {
    const response = await fetch('./src/data/c.json');
    if (!response.ok) {
      throw new Error('No se pudo obtener la lista de comentarios');
    }

    const items = (await response.json()) as CommentItem[];

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `
        <div class="text-gray-500 text-sm col-span-full text-center py-8">
          No hay comentarios disponibles en este momento.
        </div>
      `;
      return;
    }

    const sorted = [...items].sort((a, b) => {
      const da = parseMmDdYyyy(a.date)?.getTime() ?? -Infinity;
      const db = parseMmDdYyyy(b.date)?.getTime() ?? -Infinity;
      return db - da;
    });

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (const item of sorted) {
      fragment.appendChild(createCommentCard(item));
    }
    container.appendChild(fragment);
  } catch (error) {
    console.error('Error al cargar comentarios de la sección:', error);
    container.innerHTML = `
      <div class="text-red-600 text-sm col-span-full text-center py-8">
        No se pudieron cargar los comentarios.
      </div>
    `;
  }
};

const createCommentCard = (item: CommentItem): HTMLElement => {
  const card = document.createElement('article');
  card.className = 'bg-white rounded-lg overflow-hidden shadow-lg news-card';

  const body = document.createElement('div');
  body.className = 'p-6';

  const header = document.createElement('div');
  header.className = 'flex flex-row items-center gap-4 mb-4';

  const img = document.createElement('img');
  img.src = item.perfilicon;
  img.alt = `Foto de ${item.username}`;
  img.className = 'h-16 w-16 rounded-full object-cover';

  const meta = document.createElement('div');

  const name = document.createElement('h3');
  name.className = 'text-xl font-bold';
  name.textContent = item.username;

  const date = document.createElement('span');
  date.className = 'text-gray-500 text-sm';
  date.textContent = item.date;

  meta.appendChild(name);
  meta.appendChild(date);

  header.appendChild(img);
  header.appendChild(meta);

  const text = document.createElement('p');
  text.className = 'text-gray-700';
  text.textContent = item.text;

  body.appendChild(header);
  body.appendChild(text);

  card.appendChild(body);

  return card;
};

function parseMmDdYyyy(value: string): Date | null {
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
  document.addEventListener('DOMContentLoaded', setupCommentsSection);
} else {
  setupCommentsSection();
}
