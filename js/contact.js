// Contact page functionality
class ContactManager {
  constructor() {
    this.init()
  }

  init() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    const contactForm = document.getElementById("contactForm")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => this.handleContactSubmit(e))
    }
  }

  handleContactSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const name = e.target.querySelector('input[placeholder="Your Name"]').value
    const email = e.target.querySelector('input[placeholder="Your Email"]').value
    const subject = e.target.querySelector('input[placeholder="Subject"]').value
    const message = e.target.querySelector("textarea").value

    // Validate form
    if (!name || !email || !subject || !message) {
      showNotification("Please fill in all fields", "error")
      return
    }

    // Simulate form submission
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Sending..."
    submitBtn.disabled = true

    setTimeout(() => {
      showNotification("Message sent successfully! We'll get back to you soon.", "success")
      e.target.reset()
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }, 2000)
  }
}

// Initialize contact manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("contactForm")) {
    window.contactManager = new ContactManager()
  }
})

// Mock showNotification function for demonstration purposes.
// In a real application, this would be replaced with a proper notification system.
function showNotification(message, type) {
  console.log(`Notification: ${message} (Type: ${type})`)
  // You might use a library like SweetAlert or implement your own notification system here.
}
