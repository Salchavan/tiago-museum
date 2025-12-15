// Modal genérico (demo) construido con Tailwind CSS.
//
// Nota: este archivo define un modal "genérico" (no el sistema de modales del museo).
// Requiere que el HTML tenga los siguientes IDs (si alguno falta, fallará por los "!" del constructor):
// - modal-overlay, modal-content, modal-title, modal-body
// - modal-close, cancel-btn, confirm-btn, modal-form

// Opciones de configuración para abrir/actualizar el modal.
// - `content`: si se provee, se inserta como HTML y se oculta el formulario por defecto.
// - `type`: afecta el estilo del botón confirm.
// - `onConfirm`: callback opcional; si el form está visible se envía FormData.
interface ModalOptions {
  title?: string;
  content?: string;
  type?: 'default' | 'success' | 'warning' | 'danger';
  showCancel?: boolean;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: (data?: FormData) => void;
  onCancel?: () => void;
  showForm?: boolean;
  formData?: Record<string, any>;
}

class Modal {
  // Referencias a nodos del DOM.
  private overlay: HTMLElement;
  private modalContent: HTMLElement;
  private titleElement: HTMLElement;
  private bodyElement: HTMLElement;
  private closeButton: HTMLElement;
  private cancelButton: HTMLElement;
  private confirmButton: HTMLElement;
  private form: HTMLFormElement;

  // Bandera para bloquear interacciones mientras corre una animación.
  private isAnimating: boolean = false;
  // Últimas opciones usadas para poder ejecutar callbacks (cancel/confirm).
  private currentOptions?: ModalOptions;

  constructor() {
    // Inicializar elementos (se asume que existen en el HTML).
    this.overlay = document.getElementById('modal-overlay')!;
    this.modalContent = document.getElementById('modal-content')!;
    this.titleElement = document.getElementById('modal-title')!;
    this.bodyElement = document.getElementById('modal-body')!;
    this.closeButton = document.getElementById('modal-close')!;
    this.cancelButton = document.getElementById('cancel-btn')!;
    this.confirmButton = document.getElementById('confirm-btn')!;
    this.form = document.getElementById('modal-form') as HTMLFormElement;

    // Configurar event listeners (open/close/confirm/cancel).
    this.setupEventListeners();
    // Botones demo adicionales para abrir distintos tipos de modal.
    this.setupCustomButtons();
  }

  private setupEventListeners(): void {
    // Botón para abrir el modal básico (si existe en el HTML).
    const openButton = document.getElementById('open-modal');
    openButton?.addEventListener('click', () => {
      this.open();
    });

    // Cerrar modal con el botón X.
    this.closeButton.addEventListener('click', () => {
      this.close();
    });

    // Cerrar modal al hacer clic fuera (solo si no está animando).
    this.overlay.addEventListener('click', (event: MouseEvent) => {
      if (event.target === this.overlay && !this.isAnimating) {
        this.close();
      }
    });

    // Botón cancelar (ejecuta callback opcional + cierra).
    this.cancelButton.addEventListener('click', () => {
      if (this.currentOptions?.onCancel) {
        this.currentOptions.onCancel();
      }
      this.close();
    });

    // Botón confirmar (ejecuta callback opcional y luego cierra).
    this.confirmButton.addEventListener('click', () => {
      this.handleConfirm();
    });

    // Cerrar con Escape.
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.isOpen() && !this.isAnimating) {
        this.close();
      }
    });
  }

  private setupCustomButtons(): void {
    // Botones de DEMO para abrir el modal con distintas configuraciones.
    // (Solo funcionan si esos botones existen en el HTML.)

    // Modal personalizado
    const customBtn = document.getElementById('open-custom-modal');
    customBtn?.addEventListener('click', () => {
      this.open({
        title: '🎨 Modal Personalizado',
        content: `
                    <div class="space-y-4">
                        <p class="text-gray-600">Este modal tiene contenido HTML personalizado.</p>
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                            <h4 class="font-semibold text-blue-800 mb-2">✨ Características Especiales</h4>
                            <ul class="space-y-2 text-sm text-blue-700">
                                <li class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                    Diseño completamente personalizable
                                </li>
                                <li class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                    Animaciones suaves
                                </li>
                                <li class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                    Totalmente responsive
                                </li>
                            </ul>
                        </div>
                    </div>
                `,
        cancelText: 'Cerrar',
        confirmText: 'Aplicar',
        type: 'default',
      });
    });

    // Modal de éxito
    const successBtn = document.getElementById('open-success-modal');
    successBtn?.addEventListener('click', () => {
      this.open({
        title: '✅ Operación Exitosa',
        content: `
                    <div class="text-center space-y-4">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800 text-lg">¡Todo listo!</h4>
                            <p class="text-gray-600 mt-2">La operación se completó exitosamente. Puedes continuar con el siguiente paso.</p>
                        </div>
                    </div>
                `,
        showCancel: false,
        confirmText: 'Continuar',
        type: 'success',
        onConfirm: () => {
          alert('¡Acción confirmada!');
        },
      });
    });

    // Modal de advertencia
    const warningBtn = document.getElementById('open-warning-modal');
    warningBtn?.addEventListener('click', () => {
      this.open({
        title: '⚠️ Confirmación Requerida',
        content: `
                    <div class="space-y-4">
                        <div class="flex items-start space-x-3">
                            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">¿Estás seguro?</h4>
                                <p class="text-gray-600 text-sm mt-1">Esta acción no se puede deshacer. Se eliminarán todos los datos asociados permanentemente.</p>
                            </div>
                        </div>
                        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p class="text-amber-800 text-sm">
                                <span class="font-medium">Nota:</span> Esta acción afectará a 15 elementos en total.
                            </p>
                        </div>
                    </div>
                `,
        cancelText: 'Cancelar',
        confirmText: 'Eliminar',
        type: 'warning',
        onConfirm: () => {
          console.log('Acción destructiva ejecutada');
          alert('Elementos eliminados');
        },
      });
    });
  }

  public async open(options?: ModalOptions): Promise<void> {
    if (this.isAnimating) return;

    // Guardar las opciones actuales para callbacks y para configurar el UI.
    this.currentOptions = options;
    this.isAnimating = true;

    // Configurar el modal (título, contenido, botones y estilos).
    this.configure(options);

    // Mostrar overlay.
    this.overlay.classList.remove('hidden');

    // Pequeña pausa para que el navegador procese el cambio.
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Animar entrada.
    this.overlay.classList.add('opacity-0');

    requestAnimationFrame(() => {
      this.overlay.classList.remove('opacity-0');
      this.overlay.classList.add('opacity-100');

      // Resetear animación del contenido.
      this.modalContent.classList.remove('modal-enter', 'modal-exit');
      void this.modalContent.offsetWidth; // Trigger reflow
      this.modalContent.classList.add('modal-enter');

      this.isAnimating = false;
    });

    // Deshabilitar scroll del body mientras el modal está abierto.
    document.body.style.overflow = 'hidden';
  }

  public async close(): Promise<void> {
    if (this.isAnimating || !this.isOpen()) return;

    this.isAnimating = true;

    // Animar salida.
    this.modalContent.classList.remove('modal-enter');
    this.modalContent.classList.add('modal-exit');

    this.overlay.classList.remove('opacity-100');
    this.overlay.classList.add('opacity-0');

    // Esperar a que termine la animación.
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Ocultar completamente.
    this.overlay.classList.add('hidden');
    this.overlay.classList.remove('opacity-0', 'opacity-100');
    this.modalContent.classList.remove('modal-exit');

    this.isAnimating = false;

    // Restaurar scroll del body.
    document.body.style.overflow = '';

    // Resetear formulario.
    this.form.reset();
  }

  private configure(options?: ModalOptions): void {
    // Si no hay opciones, vuelve al contenido/estilos por defecto.
    if (!options) {
      this.resetToDefault();
      return;
    }

    // Título.
    if (options.title) {
      this.titleElement.textContent = options.title;
    }

    // Contenido.
    // Si `content` viene definido, se inyecta HTML y se oculta el formulario default.
    if (options.content) {
      this.bodyElement.innerHTML = options.content;
      this.form.style.display = 'none';
    } else {
      this.resetBody();
      this.form.style.display = 'block';
    }

    // Textos de botones.
    if (options.cancelText) {
      this.cancelButton.textContent = options.cancelText;
    }

    if (options.confirmText) {
      this.confirmButton.textContent = options.confirmText;
    }

    // Mostrar/ocultar botón cancelar.
    if (options.showCancel === false) {
      this.cancelButton.classList.add('hidden');
    } else {
      this.cancelButton.classList.remove('hidden');
    }

    // Estilo según tipo.
    this.applyTypeStyles(options.type);
  }

  private resetToDefault(): void {
    this.titleElement.textContent = 'Título del Modal';
    this.resetBody();
    this.cancelButton.textContent = 'Cancelar';
    this.confirmButton.textContent = 'Confirmar';
    this.cancelButton.classList.remove('hidden');
    this.form.style.display = 'block';
    this.applyTypeStyles('default');
  }

  private resetBody(): void {
    // Contenido por defecto cuando no se pasa `options.content`.
    // Incluye un form simple para demostrar el envío de FormData.
    this.bodyElement.innerHTML = `
            <p class="text-gray-600 mb-4">
                Este es un modal moderno creado con Tailwind CSS. Puedes personalizar completamente su contenido y comportamiento.
            </p>
            <form id="modal-form" class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                    </label>
                    <input type="email" 
                           id="email" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                           placeholder="tu@email.com">
                </div>
                
                <div>
                    <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje
                    </label>
                    <textarea id="message" 
                              rows="3"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="Escribe tu mensaje aquí..."></textarea>
                </div>
                
                <div class="space-y-2">
                    <label class="flex items-center">
                        <input type="checkbox" 
                               class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="ml-2 text-sm text-gray-700">Acepto los términos y condiciones</span>
                    </label>
                    <label class="flex items-center">
                        <input type="checkbox" 
                               class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="ml-2 text-sm text-gray-700">Deseo recibir notificaciones</span>
                    </label>
                </div>
            </form>
        `;

    // Reasignar el formulario porque se recreó el HTML.
    this.form = document.getElementById('modal-form') as HTMLFormElement;
  }

  private applyTypeStyles(type: string = 'default'): void {
    // Remover estilos anteriores del botón confirm.
    this.confirmButton.classList.remove(
      'bg-blue-600',
      'hover:bg-blue-700',
      'bg-green-600',
      'hover:bg-green-700',
      'bg-amber-600',
      'hover:bg-amber-700',
      'bg-red-600',
      'hover:bg-red-700'
    );

    // Aplicar nuevos estilos según tipo.
    switch (type) {
      case 'success':
        this.confirmButton.classList.add('bg-green-600', 'hover:bg-green-700');
        break;
      case 'warning':
        this.confirmButton.classList.add('bg-amber-600', 'hover:bg-amber-700');
        break;
      case 'danger':
        this.confirmButton.classList.add('bg-red-600', 'hover:bg-red-700');
        break;
      default:
        this.confirmButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
  }

  private handleConfirm(): void {
    if (this.currentOptions?.onConfirm) {
      // Si el form está visible, se envía FormData; si no, solo se confirma.
      if (this.form.style.display !== 'none') {
        const formData = new FormData(this.form);
        this.currentOptions.onConfirm(formData);
      } else {
        this.currentOptions.onConfirm();
      }
    } else {
      // Comportamiento por defecto (demo): valida un email mínimo.
      const emailInput = document.getElementById('email') as HTMLInputElement;
      if (emailInput && emailInput.value.trim() === '') {
        alert('Por favor ingresa un correo electrónico');
        emailInput.focus();
        return;
      }

      console.log('Formulario enviado');
    }

    this.close();
  }

  public isOpen(): boolean {
    return !this.overlay.classList.contains('hidden');
  }

  public setTitle(title: string): void {
    this.titleElement.textContent = title;
  }

  public setContent(content: string): void {
    this.bodyElement.innerHTML = content;
    this.form.style.display = 'none';
  }

  public update(options: ModalOptions): void {
    this.configure(options);
  }
}

// Inicializar el modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const modal = new Modal();

  // Exponer la instancia globalmente para uso externo (demo).
  (window as any).modal = modal;
});
