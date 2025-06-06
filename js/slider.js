// Hero slider functionality
class HeroSlider {
  constructor() {
    this.currentSlide = 0
    this.slides = document.querySelectorAll(".slide")
    this.dots = document.querySelectorAll(".dot")
    this.prevBtn = document.getElementById("prevBtn")
    this.nextBtn = document.getElementById("nextBtn")
    this.autoSlideInterval = null

    this.init()
  }

  init() {
    if (this.slides.length === 0) return

    this.setupEventListeners()
    this.startAutoSlide()
    this.showSlide(0)
  }

  setupEventListeners() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.prevSlide())
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.nextSlide())
    }

    // Dots navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSlide(index))
    })

    // Pause auto-slide on hover
    const sliderContainer = document.querySelector(".hero-slider")
    if (sliderContainer) {
      sliderContainer.addEventListener("mouseenter", () => this.stopAutoSlide())
      sliderContainer.addEventListener("mouseleave", () => this.startAutoSlide())
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.prevSlide()
      if (e.key === "ArrowRight") this.nextSlide()
    })

    // Touch/swipe support
    this.setupTouchEvents()
  }

  setupTouchEvents() {
    const slider = document.querySelector(".hero-slider")
    if (!slider) return

    let startX = 0
    let endX = 0

    slider.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX
    })

    slider.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX
      this.handleSwipe(startX, endX)
    })
  }

  handleSwipe(startX, endX) {
    const threshold = 50
    const diff = startX - endX

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.nextSlide()
      } else {
        this.prevSlide()
      }
    }
  }

  showSlide(index) {
    // Remove active class from all slides and dots
    this.slides.forEach((slide) => slide.classList.remove("active"))
    this.dots.forEach((dot) => dot.classList.remove("active"))

    // Add active class to current slide and dot
    if (this.slides[index]) {
      this.slides[index].classList.add("active")
    }
    if (this.dots[index]) {
      this.dots[index].classList.add("active")
    }

    this.currentSlide = index
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length
    this.showSlide(nextIndex)
  }

  prevSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length
    this.showSlide(prevIndex)
  }

  goToSlide(index) {
    this.showSlide(index)
  }

  startAutoSlide() {
    this.stopAutoSlide()
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide()
    }, 5000) // Change slide every 5 seconds
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval)
      this.autoSlideInterval = null
    }
  }
}

// Initialize slider when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new HeroSlider()
})
