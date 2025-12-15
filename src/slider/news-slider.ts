type NewsItem = {
  date: string;
  type: string;
  title: string;
  description: string;
  image: string;
  link: string;
};

class NewsSlider {
  private items: NewsItem[] = [];
  private currentIndex: number = 0;
  private slidesPerView: number = 3;
  private autoSlideInterval: number | null = null;
  private autoSlideDelay: number = 5000;

  private sliderTrack!: HTMLElement;
  private dotsContainer!: HTMLElement;
  private prevBtn!: HTMLElement;
  private nextBtn!: HTMLElement;
  private sliderViewport!: HTMLElement;

  constructor() {
    const sliderTrack = document.getElementById('news-slider-track');
    const dotsContainer = document.getElementById('news-dots-container');
    const prevBtn = document.getElementById('news-prev-btn');
    const nextBtn = document.getElementById('news-next-btn');

    if (!sliderTrack || !dotsContainer || !prevBtn || !nextBtn) {
      // La página no tiene el slider de news (o no está montado todavía).
      return;
    }

    this.sliderTrack = sliderTrack;
    this.dotsContainer = dotsContainer;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;

    const viewport = this.sliderTrack.parentElement;
    if (!viewport) {
      throw new Error('News slider viewport element not found');
    }
    this.sliderViewport = viewport as HTMLElement;

    this.setupEventListeners();

    this.updateSlidesPerView();
    window.addEventListener('resize', () => this.updateSlidesPerView());

    this.loadNews();
  }

  private async loadNews(): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/n.json`);
      if (!response.ok) {
        throw new Error('No se pudo obtener la lista de noticias');
      }

      const data = (await response.json()) as NewsItem[];
      this.items = Array.isArray(data) ? data : [];

      // Ordenar por fecha (desc), si la fecha tiene formato MM/DD/YYYY.
      this.items = [...this.items].sort((a, b) => {
        const da = this.parseMmDdYyyy(a.date)?.getTime() ?? -Infinity;
        const db = this.parseMmDdYyyy(b.date)?.getTime() ?? -Infinity;
        return db - da;
      });

      this.renderSliderCards();
      this.startAutoSlide();
    } catch (error) {
      console.error('Error cargando las noticias:', error);
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

    if (!this.items.length) {
      this.sliderTrack.innerHTML = `
        <div class="w-full text-center py-8 text-gray-500 text-sm">
          No hay noticias disponibles en este momento.
        </div>
      `;
      return;
    }

    const cardWidth = 100 / this.slidesPerView;

    this.items.forEach((item) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex-none px-2 md:px-3';
      wrapper.style.width = `${cardWidth}%`;

      const card = this.createNewsCard(item);
      wrapper.appendChild(card);
      this.sliderTrack.appendChild(wrapper);
    });

    const totalGroups = Math.max(
      1,
      Math.ceil(this.items.length / this.slidesPerView)
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

  private createNewsCard(item: NewsItem): HTMLElement {
    const card = document.createElement('article');
    card.className =
      'bg-white rounded-lg overflow-hidden shadow-lg news-card flex flex-col group h-full';

    card.innerHTML = `
      <div class="relative overflow-hidden">
        <img 
          src="${item.image}" 
          alt="${this.escapeHtml(item.title)}"
          class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div class="p-6 flex-1 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm font-semibold gold-text">${this.escapeHtml(
            item.type
          )}</span>
          <span class="text-gray-500 text-sm">${this.escapeHtml(
            item.date
          )}</span>
        </div>
        <h3 class="text-xl font-bold mb-3 line-clamp-2">${this.escapeHtml(
          item.title
        )}</h3>
        <p class="text-gray-700 mb-4 flex-1 line-clamp-3">${this.escapeHtml(
          item.description
        )}</p>
        <a 
          class="gold-text font-semibold hover:underline inline-flex items-center mt-auto"
          href="${item.link || '#'}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Saber más</span>
          <svg class="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      </div>
    `;

    return card;
  }

  private setupEventListeners(): void {
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());

    this.sliderTrack.addEventListener('mouseenter', () => this.stopAutoSlide());
    this.sliderTrack.addEventListener('mouseleave', () =>
      this.startAutoSlide()
    );
    this.prevBtn.addEventListener('mouseenter', () => this.stopAutoSlide());
    this.nextBtn.addEventListener('mouseenter', () => this.stopAutoSlide());

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
    const totalSlides = Math.ceil(this.items.length / this.slidesPerView);
    if (totalSlides <= 1) {
      return;
    }
    this.currentIndex = (this.currentIndex - 1 + totalSlides) % totalSlides;
    this.updateSliderPosition();
  }

  private nextSlide(): void {
    const totalSlides = Math.ceil(this.items.length / this.slidesPerView);
    if (totalSlides <= 1) {
      return;
    }
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

    const totalGroups = Math.ceil(this.items.length / this.slidesPerView);
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

  private showErrorState(): void {
    this.sliderTrack.innerHTML = `
      <div class="w-full text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Error al cargar</h3>
        <p class="text-gray-500">No se pudieron cargar las noticias. Por favor, intenta más tarde.</p>
        <button id="news-retry-btn" class="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          Reintentar
        </button>
      </div>
    `;

    document.getElementById('news-retry-btn')?.addEventListener('click', () => {
      this.loadNews();
    });
  }

  private parseMmDdYyyy(value: string): Date | null {
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

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NewsSlider();
});
