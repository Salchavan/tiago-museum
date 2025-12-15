import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reservationsFile = path.resolve(__dirname, 'src/data/a.json');
const restorationsFile = path.resolve(__dirname, 'src/data/r.json');
const newsFile = path.resolve(__dirname, 'src/data/n.json');

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    configureServer(server) {
      server.middlewares.use('/api/reservations', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        try {
          const body = await getRequestBody(req);
          const validation = validateReservationPayload(body);

          if (!validation.valid) {
            sendJson(res, 400, {
              success: false,
              message: validation.message,
            });
            return;
          }

          const reservations = await readReservations();
          const newReservation = {
            id: getNextReservationId(reservations),
            ...validation.data,
          };

          reservations.push(newReservation);
          await writeReservations(reservations);

          sendJson(res, 201, { success: true, reservation: newReservation });
        } catch (error) {
          console.error('Error al guardar la reserva:', error);
          sendJson(res, 500, {
            success: false,
            message: 'No se pudo guardar la reserva',
          });
        }
      });

      server.middlewares.use('/api/restorations', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        try {
          const body = await getRequestBody(req);
          const validation = validateRestorationPayload(body);

          if (!validation.valid) {
            sendJson(res, 400, {
              success: false,
              message: validation.message,
            });
            return;
          }

          const restorations = await readJsonArray(restorationsFile);
          const newRestoration = {
            restoration_id: getNextNumericId(restorations, 'restoration_id'),
            ...validation.data,
          };

          restorations.push(newRestoration);
          await writeJsonArray(restorationsFile, restorations);

          sendJson(res, 201, { success: true, restoration: newRestoration });
        } catch (error) {
          console.error('Error al guardar la restauración:', error);
          sendJson(res, 500, {
            success: false,
            message: 'No se pudo guardar la restauración',
          });
        }
      });

      server.middlewares.use('/api/news', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        try {
          const body = await getRequestBody(req);
          const validation = validateNewsPayload(body);

          if (!validation.valid) {
            sendJson(res, 400, {
              success: false,
              message: validation.message,
            });
            return;
          }

          const newsItems = await readJsonArray(newsFile);
          const newItem = {
            ...validation.data,
          };

          newsItems.push(newItem);
          await writeJsonArray(newsFile, newsItems);

          sendJson(res, 201, { success: true, news: newItem });
        } catch (error) {
          console.error('Error al guardar la noticia:', error);
          sendJson(res, 500, {
            success: false,
            message: 'No se pudo guardar la noticia',
          });
        }
      });
    },
  },
});

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', (error) => reject(error));
  });
}

async function readReservations() {
  try {
    const fileContent = await fs.readFile(reservationsFile, 'utf-8');
    return JSON.parse(fileContent || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function readJsonArray(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(fileContent || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function validateReservationPayload(payload = {}) {
  const { date, time, dni, name, tel, cuantity, mail } = payload;

  const requiredStrings = { date, time, dni, name, tel, mail };
  for (const [key, value] of Object.entries(requiredStrings)) {
    if (typeof value !== 'string' || !value.trim()) {
      return {
        valid: false,
        message: `El campo ${key} es obligatorio`,
      };
    }
  }

  const cuantityValue = Number(cuantity);
  if (!Number.isFinite(cuantityValue) || cuantityValue <= 0) {
    return {
      valid: false,
      message: 'La cantidad debe ser un número mayor que 0',
    };
  }

  return {
    valid: true,
    data: {
      date: date.trim(),
      time: time.trim(),
      dni: dni.trim(),
      name: name.trim(),
      tel: tel.trim(),
      cuantity: cuantityValue,
      mail: mail.trim(),
    },
  };
}

async function writeReservations(reservations) {
  await fs.writeFile(
    reservationsFile,
    JSON.stringify(reservations, null, 2),
    'utf-8'
  );
}

async function writeJsonArray(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function getNextReservationId(reservations = []) {
  const lastId = reservations.reduce((max, item) => {
    const numericId = Number(item?.id);
    if (Number.isFinite(numericId) && numericId > max) {
      return numericId;
    }
    return max;
  }, 0);

  return String(lastId + 1);
}

function getNextNumericId(items = [], key) {
  const lastId = items.reduce((max, item) => {
    const numericId = Number(item?.[key]);
    if (Number.isFinite(numericId) && numericId > max) {
      return numericId;
    }
    return max;
  }, 0);

  return lastId + 1;
}

function validateRestorationPayload(payload = {}) {
  const { title, description, image, date_started } = payload;

  const requiredStrings = { title, description, image, date_started };
  for (const [key, value] of Object.entries(requiredStrings)) {
    if (typeof value !== 'string' || !value.trim()) {
      return {
        valid: false,
        message: `El campo ${key} es obligatorio`,
      };
    }
  }

  return {
    valid: true,
    data: {
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      date_started: date_started.trim(),
    },
  };
}

function validateNewsPayload(payload = {}) {
  const { date, type, title, description, image, link } = payload;

  const requiredStrings = { date, type, title, description, image, link };
  for (const [key, value] of Object.entries(requiredStrings)) {
    if (typeof value !== 'string' || !value.trim()) {
      return {
        valid: false,
        message: `El campo ${key} es obligatorio`,
      };
    }
  }

  return {
    valid: true,
    data: {
      date: date.trim(),
      type: type.trim(),
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      link: link.trim(),
    },
  };
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}
