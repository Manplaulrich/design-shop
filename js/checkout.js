// Checkout page functionality with Stripe integration
class CheckoutManager {
  constructor() {
    this.stripe = null
    this.elements = null
    this.card = null
    this.clientSecret = null

    this.init()
  }

  async init() {
    // Initialize Stripe (replace with your publishable key)
    this.stripe = Stripe("pk_test_51234567890abcdef") // Replace with your actual Stripe publishable key

    this.setupStripeElements()
    this.renderOrderSummary()
    this.setupEventListeners()
    this.updateOrderTotals()

    // Check if user is logged in
    if (!window.authManager || !window.authManager.isLoggedIn()) {
      showNotification("Please login to continue", "warning")
      window.location.href = "cart.html"
      return
    }

    // Check if cart is empty
    if (cart.length === 0) {
      showNotification("Your cart is empty", "warning")
      window.location.href = "cart.html"
      return
    }
  }

  setupStripeElements() {
    this.elements = this.stripe.elements()

    // Create card element
    this.card = this.elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    })

    // Mount card element
    this.card.mount("#card-element")

    // Handle real-time validation errors from the card Element
    this.card.on("change", ({ error }) => {
      const displayError = document.getElementById("card-errors")
      if (error) {
        displayError.textContent = error.message
      } else {
        displayError.textContent = ""
      }
    })
  }

  setupEventListeners() {
    const checkoutForm = document.getElementById("checkoutForm")
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => this.handleSubmit(e))
    }

    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="payment"]')
    paymentMethods.forEach((method) => {
      method.addEventListener("change", (e) => this.handlePaymentMethodChange(e))
    })
  }

  handlePaymentMethodChange(e) {
    const cardElement = document.getElementById("card-element")

    if (e.target.value === "card") {
      cardElement.style.display = "block"
    } else {
      cardElement.style.display = "none"
    }
  }

  renderOrderSummary() {
    const orderItems = document.getElementById("orderItems")
    if (!orderItems) return

    orderItems.innerHTML = cart
      .map(
        (item) => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="order-item-info">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  updateOrderTotals() {
    const subtotal = getCartSubtotal()
    const tax = getCartTax()
    const total = subtotal + tax

    const orderSubtotal = document.getElementById("orderSubtotal")
    const orderTax = document.getElementById("orderTax")
    const orderTotal = document.getElementById("orderTotal")

    if (orderSubtotal) orderSubtotal.textContent = formatPrice(subtotal)
    if (orderTax) orderTax.textContent = formatPrice(tax)
    if (orderTotal) orderTotal.textContent = formatPrice(total)
  }

  async handleSubmit(e) {
    e.preventDefault()

    const submitBtn = document.getElementById("submitBtn")
    const buttonText = document.getElementById("button-text")
    const spinner = document.getElementById("spinner")

    // Disable submit button and show loading
    submitBtn.disabled = true
    buttonText.style.display = "none"
    spinner.classList.remove("hidden")

    const selectedPaymentMethod = document.querySelector('input[name="payment"]:checked').value

    if (selectedPaymentMethod === "paypal") {
      await this.handlePayPalPayment()
    } else {
      await this.handleStripePayment(e.target)
    }

    // Re-enable submit button
    submitBtn.disabled = false
    buttonText.style.display = "inline"
    spinner.classList.add("hidden")
  }

  async handleStripePayment(form) {
    try {
      // Create payment intent on server (simulated)
      const paymentIntent = await this.createPaymentIntent()

      if (!paymentIntent.client_secret) {
        throw new Error("Failed to create payment intent")
      }

      // Confirm payment with Stripe
      const { error, paymentIntent: confirmedPayment } = await this.stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: this.card,
            billing_details: {
              name: `${form.querySelector('input[placeholder="First Name"]').value} ${form.querySelector('input[placeholder="Last Name"]').value}`,
              email: form.querySelector('input[type="email"]').value,
              address: {
                line1: form.querySelector('input[placeholder="Address"]').value,
                city: form.querySelector('input[placeholder="City"]').value,
                postal_code: form.querySelector('input[placeholder="ZIP Code"]').value,
              },
            },
          },
        },
      )

      if (error) {
        showNotification(error.message, "error")
      } else {
        // Payment succeeded
        this.handlePaymentSuccess(confirmedPayment)
      }
    } catch (error) {
      showNotification("Payment failed. Please try again.", "error")
      console.error("Payment error:", error)
    }
  }

  async createPaymentIntent() {
    // In a real application, this would be a server-side API call
    // For demo purposes, we'll simulate the response
    const total = Math.round((getCartSubtotal() + getCartTax()) * 100) // Convert to cents

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      client_secret: "pi_test_" + Math.random().toString(36).substr(2, 9),
      amount: total,
      currency: "usd",
    }
  }

  async handlePayPalPayment() {
    // Simulate PayPal payment
    showNotification("Redirecting to PayPal...", "info")

    // Simulate PayPal processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate successful payment
    this.handlePaymentSuccess({
      id: "paypal_" + Math.random().toString(36).substr(2, 9),
      status: "succeeded",
      payment_method: "paypal",
    })
  }

  handlePaymentSuccess(payment) {
    // Clear cart
    cart.length = 0
    saveCart()

    // Store order details
    const order = {
      id: "order_" + Date.now(),
      items: [...cart],
      total: getCartSubtotal() + getCartTax(),
      paymentId: payment.id,
      status: "completed",
      date: new Date().toISOString(),
    }

    localStorage.setItem("lastOrder", JSON.stringify(order))

    // Show success message
    showNotification("Payment successful! Thank you for your purchase.", "success")

    // Redirect to success page (or show success modal)
    setTimeout(() => {
      this.showSuccessModal(order)
    }, 1000)
  }

  showSuccessModal(order) {
    const modal = document.createElement("div")
    modal.className = "modal"
    modal.style.display = "block"
    modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #27ae60; margin-bottom: 1rem;"></i>
                <h2>Order Confirmed!</h2>
                <p>Your order #${order.id} has been successfully processed.</p>
                <p>You will receive an email confirmation shortly with download links.</p>
                <div style="margin: 2rem 0;">
                    <strong>Total: ${formatPrice(order.total)}</strong>
                </div>
                <button onclick="window.location.href='index.html'" class="cta-btn">
                    Continue Shopping
                </button>
            </div>
        `

    document.body.appendChild(modal)

    // Auto redirect after 5 seconds
    setTimeout(() => {
      window.location.href = "index.html"
    }, 5000)
  }
}

// Initialize checkout manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("checkoutForm")) {
    window.checkoutManager = new CheckoutManager()
  }
})

// Mock functions and variables for demonstration purposes
function showNotification(message, type) {
  console.log(`Notification: ${message} (Type: ${type})`)
}

const cart = []

function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function getCartTax() {
  return getCartSubtotal() * 0.1 // 10% tax
}

function formatPrice(price) {
  return "$" + price.toFixed(2)
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
}
