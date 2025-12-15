// Interfaz para las restauraciones
interface Restoration {
  restoration_id: number;
  title: string;
  description: string;
  image: string;
  date_started: string;
}

class RestorationsSlider {
  private restorations: Restoration[] = [];
  private currentIndex: number = 0;
  private slidesPerView: number = 3;
  private autoSlideInterval: number | null = null;
  private autoSlideDelay: number = 5000; // 5 segundos

  // Elementos DOM
  private sliderTrack: HTMLElement;
  private dotsContainer: HTMLElement;
  private prevBtn: HTMLElement;
  private nextBtn: HTMLElement;
  private sliderViewport: HTMLElement;
  private modalListContainer: HTMLElement | null;

  constructor() {
    // Inicializar elementos DOM
    this.sliderTrack = document.getElementById('slider-track')!;
    this.dotsContainer = document.getElementById('dots-container')!;
    this.prevBtn = document.getElementById('prev-btn')!;
    this.nextBtn = document.getElementById('next-btn')!;
    this.modalListContainer = document.getElementById(
      'restorations-modal-list'
    );

    const viewport = this.sliderTrack.parentElement;
    if (!viewport) {
      throw new Error('Slider viewport element not found');
    }
    this.sliderViewport = viewport as HTMLElement;

    // Configurar event listeners
    this.setupEventListeners();

    // Ajustar slides por vista según el tamaño de pantalla
    this.updateSlidesPerView();
    window.addEventListener('resize', () => this.updateSlidesPerView());

    // Cargar datos
    this.loadRestorations();
  }

  private async loadRestorations(): Promise<void> {
    try {
      const response = await fetch('./src/data/r.json');
      this.restorations = await response.json();

      // Renderizar tarjetas
      this.renderSliderCards();
      this.renderModalCards();

      // Iniciar autoplay
      this.startAutoSlide();
    } catch (error) {
      console.error('Error cargando las restauraciones:', error);
      this.showErrorState();
    }
  }

  private updateSlidesPerView(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.slidesPerView = 1;
    } else if (width < 1024) {
      this.slidesPerView = 2;
    } else {
      this.slidesPerView = 3;
    }
    this.currentIndex = 0;
    this.renderSliderCards();
  }

  private renderSliderCards(): void {
    this.sliderTrack.innerHTML = '';
    this.dotsContainer.innerHTML = '';

    if (!this.restorations.length) {
      return;
    }

    const cardWidth = 100 / this.slidesPerView;

    this.restorations.forEach((restoration) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex-none px-2 md:px-3';
      wrapper.style.width = `${cardWidth}%`;

      const card = this.createRestorationCard(restoration, 'slider');
      wrapper.appendChild(card);
      this.sliderTrack.appendChild(wrapper);
    });

    const totalGroups = Math.max(
      1,
      Math.ceil(this.restorations.length / this.slidesPerView)
    );

    for (let group = 0; group < totalGroups; group++) {
      const dot = document.createElement('button');
      dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${
        group === this.currentIndex
          ? 'bg-black scale-125'
          : 'bg-gray-300 hover:bg-gray-400'
      }`;
      dot.setAttribute('data-slide', group.toString());
      dot.addEventListener('click', () => this.goToSlide(group));
      this.dotsContainer.appendChild(dot);
    }

    if (this.currentIndex >= totalGroups) {
      this.currentIndex = totalGroups - 1;
    }

    this.updateSliderPosition();
  }

  private createRestorationCard(
    restoration: Restoration,
    variant: 'slider' | 'modal' = 'slider'
  ): HTMLElement {
    const card = document.createElement('div');

    card.className =
      'bg-white rounded-lg overflow-hidden shadow-lg news-card flex flex-col';

    if (variant === 'slider') {
      card.classList.add('h-full');
    }

    // Formatear fecha
    const formattedDate = new Date(restoration.date_started).toLocaleDateString(
      'es-ES',
      {
        month: 'long',
        year: 'numeric',
      }
    );

    card.innerHTML = `
      <div class="relative overflow-hidden group">
        <img 
          src="${restoration.image}" 
          alt="${restoration.title}"
          class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span class="text-white text-sm bg-black/70 px-3 py-1 rounded-full">
            Iniciado: ${formattedDate}
          </span>
        </div>
      </div>
      <div class="p-6 flex-1 flex flex-col">
        <h3 class="text-xl font-bold mb-3 line-clamp-1">${restoration.title}</h3>
        <p class="text-gray-600 mb-4 flex-1 line-clamp-3">${restoration.description}</p>
        <a 
          href="#" 
          class="gold-text font-semibold hover:underline inline-flex items-center justify-between mt-auto"
          data-restoration-id="${restoration.restoration_id}"
        >
          <span>Ver proyecto</span>
          <svg class="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      </div>
    `;

    // Agregar clase para efectos de hover
    card.classList.add('group');

    // Agregar event listener al enlace
    const link = card.querySelector('a');
    link?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleProjectClick(restoration.restoration_id);
    });

    return card;
  }

  private renderModalCards(): void {
    if (!this.modalListContainer) {
      return;
    }

    this.modalListContainer.innerHTML = '';

    if (!this.restorations.length) {
      this.modalListContainer.innerHTML = `
        <div class="text-gray-500 text-sm col-span-full text-center py-8">
          No hay restauraciones disponibles en este momento.
        </div>
      `;
      return;
    }

    this.restorations.forEach((restoration) => {
      const card = this.createRestorationCard(restoration, 'modal');
      this.modalListContainer?.appendChild(card);
    });
  }

  private setupEventListeners(): void {
    // Navegación
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());

    // Pausar autoplay al interactuar
    this.sliderTrack.addEventListener('mouseenter', () => this.stopAutoSlide());
    this.sliderTrack.addEventListener('mouseleave', () =>
      this.startAutoSlide()
    );
    this.prevBtn.addEventListener('mouseenter', () => this.stopAutoSlide());
    this.nextBtn.addEventListener('mouseenter', () => this.stopAutoSlide());

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });

    // Swipe para móviles
    let touchStartX = 0;
    let touchEndX = 0;

    this.sliderTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      this.stopAutoSlide();
    });

    this.sliderTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
      this.startAutoSlide();
    });
  }

  private handleSwipe(startX: number, endX: number): void {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

  private prevSlide(): void {
    const totalSlides = Math.ceil(
      this.restorations.length / this.slidesPerView
    );
    this.currentIndex = (this.currentIndex - 1 + totalSlides) % totalSlides;
    this.updateSliderPosition();
  }

  private nextSlide(): void {
    const totalSlides = Math.ceil(
      this.restorations.length / this.slidesPerView
    );
    this.currentIndex = (this.currentIndex + 1) % totalSlides;
    this.updateSliderPosition();
  }

  private goToSlide(slideIndex: number): void {
    this.currentIndex = slideIndex;
    this.updateSliderPosition();
  }

  private updateSliderPosition(): void {
    const viewportWidth = this.sliderViewport.getBoundingClientRect().width;
    const translateX = -this.currentIndex * viewportWidth;

    this.sliderTrack.style.transform = `translateX(${translateX}px)`;

    // Actualizar puntos activos
    const dots = this.dotsContainer.querySelectorAll('button');
    dots.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.classList.remove('bg-gray-300');
        dot.classList.add('bg-black', 'scale-125');
      } else {
        dot.classList.remove('bg-black', 'scale-125');
        dot.classList.add('bg-gray-300');
      }
    });
  }

  private startAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }

    const totalGroups = Math.ceil(
      this.restorations.length / this.slidesPerView
    );

    if (totalGroups <= 1) {
      return;
    }

    this.autoSlideInterval = window.setInterval(() => {
      this.nextSlide();
    }, this.autoSlideDelay);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  private handleProjectClick(restorationId: number): void {
    console.log('Ver proyecto:', restorationId);
    // Aquí puedes implementar lógica para mostrar detalles del proyecto
    // Por ejemplo: abrir un modal, navegar a otra página, etc.
    alert(`Ver detalles del proyecto ${restorationId}`);
  }

  private showErrorState(): void {
    this.sliderTrack.innerHTML = `
      <div class="w-full text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Error al cargar</h3>
        <p class="text-gray-500">No se pudieron cargar las restauraciones. Por favor, intenta más tarde.</p>
        <button id="retry-btn" class="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          Reintentar
        </button>
      </div>
    `;

    document.getElementById('retry-btn')?.addEventListener('click', () => {
      this.loadRestorations();
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new RestorationsSlider();
});
