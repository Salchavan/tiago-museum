/**
 * Estructura base que el formulario de reservas recolecta desde el DOM.
 *
 * Nota: este proyecto se despliega en GitHub Pages (sitio estático), por lo que
 * no existe un backend real en producción. Por eso, más abajo hay 3 estrategias
 * de “guardado”:
 *  - API (solo funciona si hay servidor local con rutas /api)
 *  - File System Access API (editar un JSON local elegido por el usuario)
 *  - Descarga de a.json (fallback universal + cache en localStorage)
 */
type ReservationFormPayload = {
  date: string;
  time: string;
  dni: string;
  name: string;
  tel: string;
  cuantity: number;
  mail: string;
};

/**
 * Entrada persistida (agrega un `id` incremental como string para mantener
 * compatibilidad con los JSON existentes).
 */
type ReservationEntry = ReservationFormPayload & {
  id: string;
};

type FilePickerWindow = Window & {
  showOpenFilePicker?: (
    // Some TS DOM libs don't include OpenFilePickerOptions
    options?: unknown
  ) => Promise<FileSystemFileHandle[]>;
};

let reservationsFileHandle: FileSystemFileHandle | null = null;

/**
 * Inicializa el formulario de reservas:
 * - valida campos
 * - muestra estados (info/success/error)
 * - intenta persistir la reserva con la mejor estrategia disponible
 */
const initReservationForm = (): void => {
  const form = document.getElementById(
    'reservation-form'
  ) as HTMLFormElement | null;
  const statusEl = document.getElementById('reservation-status');

  if (!form || !statusEl) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Convertimos el FormData a un payload tipado y validado.
    const payload = buildPayload(new FormData(form));
    if (!payload) {
      setStatus(statusEl, 'Completa todos los campos obligatorios.', 'error');
      return;
    }

    setStatus(statusEl, 'Enviando reserva...', 'info');

    try {
      // Dependiendo del entorno/soporte del navegador puede:
      // - guardarse vía API (solo si hay backend)
      // - escribirse en un archivo local elegido por el usuario
      // - descargarse como a.json actualizado
      const mode = await appendReservationToLocalJson(payload);

      form.reset();
      if (mode === 'download') {
        setStatus(
          statusEl,
          'Reserva guardada. Se descargó a.json actualizado (reemplaza public/data/a.json).',
          'success'
        );
      } else if (mode === 'api') {
        setStatus(
          statusEl,
          'Reserva guardada en public/data/a.json.',
          'success'
        );
      } else {
        setStatus(
          statusEl,
          'Reserva enviada correctamente. Te contactaremos a la brevedad.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
      setStatus(
        statusEl,
        'No se pudo guardar la reserva. Intenta nuevamente más tarde.',
        'error'
      );
    }
  });
};

const buildPayload = (formData: FormData): ReservationFormPayload | null => {
  const getValue = (name: string): string =>
    String(formData.get(name) ?? '').trim();

  const date = getValue('date');
  const time = getValue('time');
  const dni = getValue('dni');
  const name = getValue('name');
  const tel = getValue('tel');
  const mail = getValue('mail');
  const cuantityValue = Number(formData.get('cuantity'));

  if (
    !date ||
    !time ||
    !dni ||
    !name ||
    !tel ||
    !mail ||
    !Number.isFinite(cuantityValue) ||
    cuantityValue <= 0
  ) {
    return null;
  }

  return {
    date,
    time,
    dni,
    name,
    tel,
    mail,
    cuantity: cuantityValue,
  };
};

const setStatus = (
  element: HTMLElement,
  message: string,
  tone: 'info' | 'success' | 'error'
): void => {
  // Tailwind classes: cambiamos solo color del texto según el estado.
  const toneClasses: Record<'info' | 'success' | 'error', string> = {
    info: 'text-gray-600',
    success: 'text-green-600',
    error: 'text-red-600',
  };

  element.textContent = message;
  element.classList.remove('text-gray-600', 'text-green-600', 'text-red-600');
  element.classList.add(toneClasses[tone]);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReservationForm);
} else {
  initReservationForm();
}

/**
 * Intenta “persistir” la reserva con distintas estrategias.
 *
 * Orden:
 * 1) API (si existe un servidor local que implemente /api/reservations)
 * 2) File System Access API (editar el JSON local seleccionado por el usuario)
 * 3) Descarga del a.json actualizado (siempre disponible)
 */
const appendReservationToLocalJson = async (
  payload: ReservationFormPayload
): Promise<'api' | 'file' | 'download'> => {
  try {
    await appendReservationByApi(payload);
    return 'api';
  } catch {
    // ignore and try other strategies
  }

  // File System Access API (Chromium): permite escribir en un archivo local
  // elegido por el usuario (ideal para “actualizar” public/data/a.json durante
  // desarrollo sin backend).
  const picker = (window as FilePickerWindow).showOpenFilePicker;
  if (picker) {
    const handle = await ensureReservationsFileHandle();
    const current = await readReservations(handle);
    const next: ReservationEntry = {
      id: getNextReservationId(current),
      ...payload,
    };

    current.push(next);
    await writeReservations(handle, current);
    return 'file';
  }

  // Fallback universal: genera a.json actualizado y lo descarga.
  await appendReservationByDownload(payload);
  return 'download';
};

const appendReservationByApi = async (
  payload: ReservationFormPayload
): Promise<void> => {
  // Endpoint pensado para un backend local (no existe en GH Pages).
  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(data?.message || 'No se pudo guardar la reserva');
  }
};

const ensureReservationsFileHandle =
  async (): Promise<FileSystemFileHandle> => {
    if (reservationsFileHandle) {
      return reservationsFileHandle;
    }

    const picker = (window as FilePickerWindow).showOpenFilePicker;
    if (!picker) {
      throw new Error('No disponible showOpenFilePicker');
    }

    const [handle] = await picker({
      multiple: false,
      types: [
        {
          description: 'Archivo JSON',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });

    if (!handle) {
      throw new Error('No se seleccionó ningún archivo');
    }

    reservationsFileHandle = handle;
    return handle;
  };

const appendReservationByDownload = async (
  payload: ReservationFormPayload
): Promise<void> => {
  // Leemos desde cache local si existe; si no, intentamos obtener data/a.json.
  const current = await readReservationsFromCacheOrFetch();
  const next: ReservationEntry = {
    id: getNextReservationId(current),
    ...payload,
  };

  const updated = [...current, next];

  // Guardamos el “estado” en localStorage para no perder reservas agregadas
  // si el usuario no reemplaza manualmente public/data/a.json.
  localStorage.setItem('tiago-museum:reservations', JSON.stringify(updated));
  downloadJsonFile('a.json', updated);
};

const readReservationsFromCacheOrFetch = async (): Promise<
  ReservationEntry[]
> => {
  // Cache en localStorage: útil para simular persistencia en un sitio estático.
  const cached = localStorage.getItem('tiago-museum:reservations');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed as ReservationEntry[];
      }
    } catch {
      // ignore
    }
  }

  try {
    // En producción (GH Pages) el JSON debe vivir en public/data para existir
    // dentro de dist/. Se respeta BASE_URL para project-sites.
    const response = await fetch(`${import.meta.env.BASE_URL}data/a.json`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    const parsed = await response.json();
    return Array.isArray(parsed) ? (parsed as ReservationEntry[]) : [];
  } catch {
    return [];
  }
};

const downloadJsonFile = (fileName: string, data: unknown): void => {
  // Genera una descarga directa en el navegador (sin servidor).
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

const readReservations = async (
  handle: FileSystemFileHandle
): Promise<ReservationEntry[]> => {
  // Lee y valida una lista JSON desde un FileSystemFileHandle.
  const file = await handle.getFile();
  const text = await file.text();

  if (!text.trim()) {
    return [];
  }

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is ReservationEntry => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Partial<ReservationEntry>;
    return typeof candidate.id === 'string';
  });
};

const writeReservations = async (
  handle: FileSystemFileHandle,
  reservations: ReservationEntry[]
): Promise<void> => {
  // Escribe la lista completa al archivo (sobrescribe el contenido).
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(reservations, null, 2));
  await writable.close();
};

const getNextReservationId = (reservations: ReservationEntry[]): string => {
  // IDs numéricos como string: busca el máximo para generar el siguiente.
  const lastId = reservations.reduce((max, item) => {
    const numericId = Number(item.id);
    if (Number.isFinite(numericId) && numericId > max) {
      return numericId;
    }
    return max;
  }, 0);

  return String(lastId + 1);
};
