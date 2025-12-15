type FakeReservation = {
  date: string; // YYYY-MM-DD
  time: string;
  name: string;
  cuantity: number;
};

const setupCalendarReservationsModal = (): void => {
  const openButton = document.getElementById(
    'open-calendar-reservations-modal'
  );
  const modal = document.getElementById('calendar-reservations-modal');
  const closeButton = modal?.querySelector(
    '[data-modal-close]'
  ) as HTMLButtonElement | null;

  if (!openButton || !modal) {
    return;
  }

  const titleEl = modal.querySelector(
    '#calendar-title'
  ) as HTMLParagraphElement | null;
  const gridEl = modal.querySelector('#calendar-grid') as HTMLDivElement | null;

  if (!gridEl) {
    return;
  }

  const toggleModal = (show: boolean): void => {
    if (show) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      renderCalendar(new Date(), getFakeReservations(), titleEl, gridEl);
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

function renderCalendar(
  date: Date,
  reservations: FakeReservation[],
  titleEl: HTMLParagraphElement | null,
  gridEl: HTMLDivElement
): void {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11

  const monthLabel = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));

  if (titleEl) {
    titleEl.textContent = capitalizeFirstLetter(monthLabel);
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Convert JS day (0=Sun..6=Sat) into Monday-first index (0=Mon..6=Sun)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const reservationsByDate = groupReservationsByDate(reservations);

  const weekdayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  gridEl.innerHTML = `
    <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
      ${weekdayLabels
        .map(
          (label) =>
            `<div class="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">${label}</div>`
        )
        .join('')}
    </div>
    <div class="grid grid-cols-7">
      ${Array.from({ length: totalCells })
        .map((_, index) => {
          const dayNumber = index - startOffset + 1;
          const isInMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

          if (!isInMonth) {
            return `<div class="h-20 md:h-24 border-b border-gray-100 border-r border-gray-100 bg-white"></div>`;
          }

          const isoDate = toIsoDate(year, month, dayNumber);
          const dayReservations = reservationsByDate.get(isoDate) ?? [];

          const maxVisible = 2;
          const visible = dayReservations.slice(0, maxVisible);
          const remaining = dayReservations.length - visible.length;

          const reservationsHtml = visible
            .map(
              (item) => `
                <div class="mt-1 text-[11px] leading-tight bg-black text-white rounded-md px-2 py-1">
                  <span class="font-semibold">${escapeHtml(item.time)}</span>
                  <span class="opacity-90"> ${escapeHtml(item.name)}</span>
                </div>
              `
            )
            .join('');

          const moreHtml =
            remaining > 0
              ? `<div class="mt-1 text-[11px] text-gray-600">+${remaining} más</div>`
              : '';

          return `
            <div class="h-20 md:h-24 border-b border-gray-100 border-r border-gray-100 p-2 bg-white">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-800">${dayNumber}</span>
                ${
                  dayReservations.length
                    ? '<span class="text-[10px] font-semibold text-gray-500">reservas</span>'
                    : ''
                }
              </div>
              <div class="mt-1">${reservationsHtml}${moreHtml}</div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function getFakeReservations(): FakeReservation[] {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const mk = (
    dayOffset: number,
    time: string,
    name: string,
    cuantity: number
  ) => {
    const d = new Date(base);
    d.setDate(base.getDate() + dayOffset);
    return {
      date: toIsoDate(d.getFullYear(), d.getMonth(), d.getDate()),
      time,
      name,
      cuantity,
    } satisfies FakeReservation;
  };

  return [
    mk(1, '10:00', 'Familia García', 4),
    mk(1, '12:30', 'Colegio San Martín', 18),
    mk(3, '11:00', 'Ana López', 2),
    mk(6, '09:30', 'Grupo Turismo Córdoba', 12),
    mk(9, '16:00', 'Martín Pérez', 3),
    mk(12, '14:30', 'Visita guiada (Prueba)', 10),
  ];
}

function groupReservationsByDate(
  items: FakeReservation[]
): Map<string, FakeReservation[]> {
  const map = new Map<string, FakeReservation[]>();

  for (const item of items) {
    const list = map.get(item.date);
    if (list) {
      list.push(item);
    } else {
      map.set(item.date, [item]);
    }
  }

  // Stable sorting by time
  for (const [key, list] of map) {
    list.sort((a, b) => a.time.localeCompare(b.time));
    map.set(key, list);
  }

  return map;
}

function toIsoDate(year: number, monthIndex: number, day: number): string {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function capitalizeFirstLetter(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCalendarReservationsModal);
} else {
  setupCalendarReservationsModal();
}
