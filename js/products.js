// Products page functionality
class ProductsManager {
  constructor(products, debounce) {
    this.products = products
    this.debounce = debounce
    this.filteredProducts = [...products]
    this.currentPage = 1
    this.productsPerPage = 9
    this.currentView = "grid"
    this.filters = {
      categories: [],
      priceRange: 100,
      sortBy: "featured",
    }

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadUrlParameters()
    this.applyFilters()
    this.renderProducts()
    this.updateResultsCount()
  }

  setupEventListeners() {
    // Filter checkboxes
    const categoryCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]')
    categoryCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => this.handleCategoryFilter())
    })

    // Price range slider
    const priceRange = document.getElementById("priceRange")
    if (priceRange) {
      priceRange.addEventListener("input", (e) => this.handlePriceFilter(e))
    }

    // Sort dropdown
    const sortSelect = document.getElementById("sortSelect")
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => this.handleSort(e))
    }

    // Clear filters button
    const clearFilters = document.getElementById("clearFilters")
    if (clearFilters) {
      clearFilters.addEventListener("click", () => this.clearAllFilters())
    }

    // View toggle buttons
    const viewBtns = document.querySelectorAll(".view-btn")
    viewBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleViewChange(e))
    })

    // Search input
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        this.debounce((e) => this.handleSearch(e), 300),
      )
    }
  }

  loadUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search)
    const search = urlParams.get("search")
    const category = urlParams.get("category")

    if (search) {
      const searchInput = document.getElementById("searchInput")
      if (searchInput) {
        searchInput.value = search
        this.handleSearch({ target: { value: search } })
      }
    }

    if (category) {
      const categoryCheckbox = document.querySelector(`input[value="${category}"]`)
      if (categoryCheckbox) {
        categoryCheckbox.checked = true
        this.handleCategoryFilter()
      }
    }
  }

  handleCategoryFilter() {
    const checkedCategories = Array.from(
      document.querySelectorAll('.filter-options input[type="checkbox"]:checked'),
    ).map((cb) => cb.value)

    this.filters.categories = checkedCategories
    this.currentPage = 1
    this.applyFilters()
    this.renderProducts()
    this.updateResultsCount()
  }

  handlePriceFilter(e) {
    this.filters.priceRange = Number.parseFloat(e.target.value)
    document.getElementById("priceValue").textContent = this.filters.priceRange

    this.currentPage = 1
    this.applyFilters()
    this.renderProducts()
    this.updateResultsCount()
  }

  handleSort(e) {
    this.filters.sortBy = e.target.value
    this.applyFilters()
    this.renderProducts()
  }

  handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim()
    this.searchTerm = searchTerm
    this.currentPage = 1
    this.applyFilters()
    this.renderProducts()
    this.updateResultsCount()
  }

  handleViewChange(e) {
    const viewBtns = document.querySelectorAll(".view-btn")
    viewBtns.forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    this.currentView = e.target.dataset.view
    this.renderProducts()
  }

  clearAllFilters() {
    // Reset checkboxes
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach((cb) => {
      cb.checked = false
    })

    // Reset price range
    const priceRange = document.getElementById("priceRange")
    if (priceRange) {
      priceRange.value = 100
      document.getElementById("priceValue").textContent = "100"
    }

    // Reset sort
    const sortSelect = document.getElementById("sortSelect")
    if (sortSelect) {
      sortSelect.value = "featured"
    }

    // Reset search
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
      searchInput.value = ""
    }

    // Reset filters
    this.filters = {
      categories: [],
      priceRange: 100,
      sortBy: "featured",
    }
    this.searchTerm = ""
    this.currentPage = 1

    this.applyFilters()
    this.renderProducts()
    this.updateResultsCount()
  }

  applyFilters() {
    let filtered = [...this.products]

    // Apply category filter
    if (this.filters.categories.length > 0) {
      filtered = filtered.filter((product) => this.filters.categories.includes(product.category))
    }

    // Apply price filter
    filtered = filtered.filter((product) => product.price <= this.filters.priceRange)

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(this.searchTerm) ||
          product.description.toLowerCase().includes(this.searchTerm) ||
          product.category.toLowerCase().includes(this.searchTerm),
      )
    }

    // Apply sorting
    switch (this.filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort((a, b) => b.id - a.id)
        break
      case "popular":
        filtered.sort((a, b) => b.downloads - a.downloads)
        break
      default:
        // Featured - keep original order
        break
    }

    this.filteredProducts = filtered
  }

  renderProducts() {
    const productGrid = document.getElementById("productGrid")
    if (!productGrid) return

    const startIndex = (this.currentPage - 1) * this.productsPerPage
    const endIndex = startIndex + this.productsPerPage
    const productsToShow = this.filteredProducts.slice(startIndex, endIndex)

    if (productsToShow.length === 0) {
      productGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `
      return
    }

    const gridClass = this.currentView === "list" ? "product-grid list-view" : "product-grid"
    productGrid.className = gridClass

    productGrid.innerHTML = productsToShow.map((product) => this.createProductCard(product)).join("")

    this.renderPagination()
  }

  createProductCard(product) {
    const cardClass = this.currentView === "list" ? "product-card list-card" : "product-card"

    return `
            <div class="${cardClass}" data-product-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <div class="product-rating">
                            ${"★".repeat(Math.floor(product.rating))} ${product.rating}
                        </div>
                        <div class="product-downloads">${product.downloads} downloads</div>
                    </div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `
  }

  renderPagination() {
    const pagination = document.getElementById("pagination")
    if (!pagination) return

    const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage)

    if (totalPages <= 1) {
      pagination.innerHTML = ""
      return
    }

    let paginationHTML = ""

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `<button onclick="productsManager.goToPage(${this.currentPage - 1})">Previous</button>`
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === this.currentPage ? "active" : ""
      paginationHTML += `<button class="${activeClass}" onclick="productsManager.goToPage(${i})">${i}</button>`
    }

    // Next button
    if (this.currentPage < totalPages) {
      paginationHTML += `<button onclick="productsManager.goToPage(${this.currentPage + 1})">Next</button>`
    }

    pagination.innerHTML = paginationHTML
  }

  goToPage(page) {
    this.currentPage = page
    this.renderProducts()

    // Scroll to top of products
    document.getElementById("productGrid").scrollIntoView({ behavior: "smooth" })
  }

  updateResultsCount() {
    const resultsCount = document.getElementById("resultsCount")
    if (resultsCount) {
      resultsCount.textContent = this.filteredProducts.length
    }
  }
}

// Initialize products manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productGrid")) {
    // Assuming 'products' and 'debounce' are globally available or defined elsewhere
    window.productsManager = new ProductsManager(products, debounce)
  }
})
