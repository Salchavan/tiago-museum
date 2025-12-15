type ReservationFormPayload = {
  date: string;
  time: string;
  dni: string;
  name: string;
  tel: string;
  cuantity: number;
  mail: string;
};

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

    const payload = buildPayload(new FormData(form));
    if (!payload) {
      setStatus(statusEl, 'Completa todos los campos obligatorios.', 'error');
      return;
    }

    setStatus(statusEl, 'Enviando reserva...', 'info');

    try {
      const mode = await appendReservationToLocalJson(payload);

      form.reset();
      if (mode === 'download') {
        setStatus(
          statusEl,
          'Reserva guardada. Se descargó a.json actualizado (reemplaza src/data/a.json).',
          'success'
        );
      } else if (mode === 'api') {
        setStatus(statusEl, 'Reserva guardada en src/data/a.json.', 'success');
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

const appendReservationToLocalJson = async (
  payload: ReservationFormPayload
): Promise<'api' | 'file' | 'download'> => {
  try {
    await appendReservationByApi(payload);
    return 'api';
  } catch {
    // ignore and try other strategies
  }

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

  await appendReservationByDownload(payload);
  return 'download';
};

const appendReservationByApi = async (
  payload: ReservationFormPayload
): Promise<void> => {
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
  const current = await readReservationsFromCacheOrFetch();
  const next: ReservationEntry = {
    id: getNextReservationId(current),
    ...payload,
  };

  const updated = [...current, next];
  localStorage.setItem('tiago-museum:reservations', JSON.stringify(updated));
  downloadJsonFile('a.json', updated);
};

const readReservationsFromCacheOrFetch = async (): Promise<
  ReservationEntry[]
> => {
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
    const response = await fetch('/src/data/a.json', { cache: 'no-store' });
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
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(reservations, null, 2));
  await writable.close();
};

const getNextReservationId = (reservations: ReservationEntry[]): string => {
  const lastId = reservations.reduce((max, item) => {
    const numericId = Number(item.id);
    if (Number.isFinite(numericId) && numericId > max) {
      return numericId;
    }
    return max;
  }, 0);

  return String(lastId + 1);
};
