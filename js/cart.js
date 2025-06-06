// Import necessary functions and data
import { updateQuantity, removeFromCart, getCartSubtotal, getCartTax, formatPrice, showNotification } from "./utils.js"
import { cart } from "./data.js"

// Cart page functionality
class CartManager {
  constructor() {
    this.init()
  }

  init() {
    this.renderCartItems()
    this.updateCartSummary()
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Promo code
    const applyPromo = document.getElementById("applyPromo")
    if (applyPromo) {
      applyPromo.addEventListener("click", () => this.applyPromoCode())
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", (e) => this.handleCheckout(e))
    }
  }

  renderCartItems() {
    const cartItems = document.getElementById("cartItems")
    if (!cartItems) return

    if (cart.length === 0) {
      cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some amazing products to get started!</p>
                    <a href="products.html" class="cta-btn">Browse Products</a>
                </div>
            `
      return
    }

    cartItems.innerHTML = cart.map((item) => this.createCartItem(item)).join("")
  }

  createCartItem(item) {
    return `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-description">${item.description}</p>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cartManager.updateItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cartManager.updateItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-btn" onclick="cartManager.removeItem(${item.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `
  }

  updateItemQuantity(productId, newQuantity) {
    updateQuantity(productId, newQuantity)
    this.renderCartItems()
    this.updateCartSummary()
  }

  removeItem(productId) {
    removeFromCart(productId)
    this.renderCartItems()
    this.updateCartSummary()
  }

  updateCartSummary() {
    const subtotal = getCartSubtotal()
    const tax = getCartTax()
    const total = subtotal + tax

    const subtotalElement = document.getElementById("subtotal")
    const taxElement = document.getElementById("tax")
    const totalElement = document.getElementById("total")

    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal)
    if (taxElement) taxElement.textContent = formatPrice(tax)
    if (totalElement) totalElement.textContent = formatPrice(total)

    // Update checkout button state
    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) {
      if (cart.length === 0) {
        checkoutBtn.style.opacity = "0.5"
        checkoutBtn.style.pointerEvents = "none"
      } else {
        checkoutBtn.style.opacity = "1"
        checkoutBtn.style.pointerEvents = "auto"
      }
    }
  }

  applyPromoCode() {
    const promoInput = document.getElementById("promoInput")
    if (!promoInput) return

    const promoCode = promoInput.value.trim().toUpperCase()

    // Sample promo codes
    const promoCodes = {
      SAVE10: { discount: 0.1, type: "percentage" },
      WELCOME: { discount: 5, type: "fixed" },
      STUDENT: { discount: 0.15, type: "percentage" },
    }

    if (promoCodes[promoCode]) {
      const promo = promoCodes[promoCode]
      let discount = 0

      if (promo.type === "percentage") {
        discount = getCartSubtotal() * promo.discount
      } else {
        discount = promo.discount
      }

      showNotification(`Promo code applied! You saved ${formatPrice(discount)}`, "success")
      promoInput.value = ""
    } else {
      showNotification("Invalid promo code", "error")
    }
  }

  handleCheckout(e) {
    if (cart.length === 0) {
      e.preventDefault()
      showNotification("Your cart is empty", "warning")
      return
    }

    // Check if user is logged in
    if (!window.authManager || !window.authManager.isLoggedIn()) {
      e.preventDefault()
      showNotification("Please login to proceed to checkout", "warning")
      window.authManager.showLoginModal()
      return
    }
  }
}

// Initialize cart manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cartItems")) {
    window.cartManager = new CartManager()
  }
})
