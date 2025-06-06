// Global variables
let cart = JSON.parse(localStorage.getItem("cart")) || []
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null

// Sample product data
const products = [
  {
    id: 1,
    name: "Modern Logo Design",
    description:
      "Professional logo design perfect for startups and modern businesses. Clean, minimalist style with multiple format options.",
    price: 49.99,
    image: "image/old/soe.jpg",
    category: "graphics",
    rating: 4.8,
    downloads: 1250,
  },
  {
    id: 2,
    name: "Website Template Pack",
    description:
      "Complete responsive website template with 5 pages. Perfect for agencies and portfolios with modern design.",
    price: 89.99,
    image: "image/old/shoes1.jpg",
    category: "templates",
    rating: 4.9,
    downloads: 890,
  },
  {
    id: 3,
    name: "Premium Font Bundle",
    description:
      "Collection of 12 premium fonts for all your design needs. Commercial license included with web fonts.",
    price: 29.99,
    image: "image/new/mendress.jpg",
    category: "fonts",
    rating: 4.7,
    downloads: 2100,
  },
  {
    id: 4,
    name: "Hand-drawn Illustrations",
    description: "Set of 50 unique hand-drawn illustrations in vector format. Perfect for web and print projects.",
    price: 39.99,
    image: "image/new/whatche.jpg",
    category: "illustrations",
    rating: 4.6,
    downloads: 750,
  },
  {
    id: 5,
    name: "Business Card Templates",
    description: "10 professional business card templates in various styles. Easy to customize with your brand colors.",
    price: 19.99,
    image: "image/new/dress1.jpg",
    category: "templates",
    rating: 4.5,
    downloads: 1500,
  },
  {
    id: 6,
    name: "Icon Set Collection",
    description: "500+ premium icons in multiple formats. Perfect for apps and websites with consistent design.",
    price: 24.99,
    image: "image/new/whatches.png",
    category: "graphics",
    rating: 4.8,
    downloads: 3200,
  },
  {
    id: 7,
    name: "Calligraphy Font Pack",
    description: "Beautiful calligraphy fonts for wedding invitations and elegant designs. Includes script variations.",
    price: 34.99,
    image: "image/new/shoe3.jpg",
    category: "fonts",
    rating: 4.4,
    downloads: 680,
  },
  {
    id: 8,
    name: "Abstract Art Collection",
    description:
      "Modern abstract illustrations perfect for contemporary design projects. High-resolution files included.",
    price: 44.99,
    image: "image/new/mendress.webp",
    category: "illustrations",
    rating: 4.7,
    downloads: 920,
  },
  {
    id: 9,
    name: "Social Media Templates",
    description: "Complete social media template pack for Instagram, Facebook, and Twitter. Boost your engagement.",
    price: 27.99,
    image: "image/new/shoe.png",
    category: "templates",
    rating: 4.6,
    downloads: 1800,
  },
  {
    id: 10,
    name: "Vintage Logo Collection",
    description: "Retro and vintage logo designs perfect for breweries, cafes, and artisan businesses.",
    price: 54.99,
    image: " image/old/new.jpg",
    category: "graphics",
    rating: 4.9,
    downloads: 1100,
  },
]

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI()
  updateUserUI()
  setupGlobalEventListeners()

  // Load featured products on home page
  if (document.getElementById("featuredProducts")) {
    loadFeaturedProducts()
  }
})

// Setup global event listeners
function setupGlobalEventListeners() {
  // User menu toggle
  const userBtn = document.getElementById("userBtn")
  const userDropdown = document.getElementById("userDropdown")

  if (userBtn && userDropdown) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      userDropdown.classList.toggle("show")
    })

    document.addEventListener("click", () => {
      userDropdown.classList.remove("show")
    })
  }

  // Newsletter form
  const newsletterForm = document.getElementById("newsletterForm")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", handleNewsletterSubmit)
  }

  // Search functionality
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleGlobalSearch, 300))
  }
}

// Cart functions
function addToCart(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  const existingItem = cart.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({ ...product, quantity: 1 })
  }

  saveCart()
  updateCartUI()
  showNotification("Product added to cart!", "success")
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  saveCart()
  updateCartUI()
  showNotification("Product removed from cart", "info")
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId)
    return
  }

  const item = cart.find((item) => item.id === productId)
  if (item) {
    item.quantity = newQuantity
    saveCart()
    updateCartUI()
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount")
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = totalItems
    cartCount.style.display = totalItems > 0 ? "flex" : "none"
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function getCartSubtotal() {
  return getCartTotal()
}

function getCartTax() {
  return getCartSubtotal() * 0.08 // 8% tax
}

// Product functions
function createProductCard(product) {
  return `
        <div class="product-card" data-product-id="${product.id}">
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

function loadFeaturedProducts() {
  const featuredProducts = document.getElementById("featuredProducts")
  if (!featuredProducts) return

  // Show first 6 products as featured
  const featured = products.slice(0, 6)
  featuredProducts.innerHTML = featured.map((product) => createProductCard(product)).join("")
}

// Search functionality
function handleGlobalSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim()
  if (searchTerm.length < 2) return

  // Redirect to products page with search parameter
  window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`
}

// Newsletter
function handleNewsletterSubmit(e) {
  e.preventDefault()
  const email = e.target.querySelector('input[type="email"]').value

  // Simulate newsletter subscription
  showNotification("Thank you for subscribing to our newsletter!", "success")
  e.target.reset()
}

// User authentication functions
function updateUserUI() {
  const loginBtn = document.getElementById("loginBtn")
  const signupBtn = document.getElementById("signupBtn")
  const profileBtn = document.getElementById("profileBtn")
  const logoutBtn = document.getElementById("logoutBtn")

  if (currentUser) {
    if (loginBtn) loginBtn.style.display = "none"
    if (signupBtn) signupBtn.style.display = "none"
    if (profileBtn) {
      profileBtn.style.display = "block"
      profileBtn.textContent = currentUser.name
    }
    if (logoutBtn) logoutBtn.style.display = "block"
  } else {
    if (loginBtn) loginBtn.style.display = "block"
    if (signupBtn) signupBtn.style.display = "block"
    if (profileBtn) profileBtn.style.display = "none"
    if (logoutBtn) logoutBtn.style.display = "none"
  }
}

// Utility functions
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function formatPrice(price) {
  return `$${price.toFixed(2)}`
}

function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

// Export functions for use in other files
window.addToCart = addToCart
window.removeFromCart = removeFromCart
window.updateQuantity = updateQuantity
window.products = products
window.cart = cart
window.currentUser = currentUser
window.showNotification = showNotification
window.formatPrice = formatPrice
window.getUrlParameter = getUrlParameter
