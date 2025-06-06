// Enhanced Authentication with API Integration
class AuthManager {
  constructor() {
    this.apiClient = window.apiClient
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.updateUI()
  }

  setupEventListeners() {
    // Modal triggers
    const loginBtn = document.getElementById("loginBtn")
    const signupBtn = document.getElementById("signupBtn")
    const logoutBtn = document.getElementById("logoutBtn")

    if (loginBtn) {
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault()
        this.showLoginModal()
      })
    }

    if (signupBtn) {
      signupBtn.addEventListener("click", (e) => {
        e.preventDefault()
        this.showSignupModal()
      })
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault()
        this.logout()
      })
    }

    // Modal close buttons
    const closeLogin = document.getElementById("closeLogin")
    const closeSignup = document.getElementById("closeSignup")

    if (closeLogin) {
      closeLogin.addEventListener("click", () => this.hideLoginModal())
    }

    if (closeSignup) {
      closeSignup.addEventListener("click", () => this.hideSignupModal())
    }

    // Switch between modals
    const switchToSignup = document.getElementById("switchToSignup")
    const switchToLogin = document.getElementById("switchToLogin")

    if (switchToSignup) {
      switchToSignup.addEventListener("click", (e) => {
        e.preventDefault()
        this.hideLoginModal()
        this.showSignupModal()
      })
    }

    if (switchToLogin) {
      switchToLogin.addEventListener("click", (e) => {
        e.preventDefault()
        this.hideSignupModal()
        this.showLoginModal()
      })
    }

    // Form submissions
    const loginForm = document.getElementById("loginForm")
    const signupForm = document.getElementById("signupForm")

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e))
    }

    if (signupForm) {
      signupForm.addEventListener("submit", (e) => this.handleSignup(e))
    }

    // Close modals when clicking outside
    const loginModal = document.getElementById("loginModal")
    const signupModal = document.getElementById("signupModal")

    if (loginModal) {
      loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) this.hideLoginModal()
      })
    }

    if (signupModal) {
      signupModal.addEventListener("click", (e) => {
        if (e.target === signupModal) this.hideSignupModal()
      })
    }
  }

  async handleLogin(e) {
    e.preventDefault()

    const email = e.target.querySelector('input[type="email"]').value
    const password = e.target.querySelector('input[type="password"]').value

    if (!email || !password) {
      window.showNotification("Please fill in all fields", "error")
      return
    }

    try {
      // Show loading state
      const submitBtn = e.target.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Logging in..."
      submitBtn.disabled = true

      const response = await this.apiClient.login({ email, password })

      if (response.success) {
        this.hideLoginModal()
        this.updateUI()
        window.showNotification("Login successful!", "success")
        e.target.reset()
      }
    } catch (error) {
      window.showNotification(error.message, "error")
    } finally {
      // Reset button state
      const submitBtn = e.target.querySelector('button[type="submit"]')
      submitBtn.textContent = "Login"
      submitBtn.disabled = false
    }
  }

  async handleSignup(e) {
    e.preventDefault()

    const inputs = e.target.querySelectorAll("input")
    const username = inputs[0].value
    const email = inputs[1].value
    const password = inputs[2].value
    const confirmPassword = inputs[3].value

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      window.showNotification("Please fill in all fields", "error")
      return
    }

    if (password !== confirmPassword) {
      window.showNotification("Passwords do not match", "error")
      return
    }

    if (password.length < 6) {
      window.showNotification("Password must be at least 6 characters", "error")
      return
    }

    try {
      // Show loading state
      const submitBtn = e.target.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Creating Account..."
      submitBtn.disabled = true

      const response = await this.apiClient.register({ username, email, password })

      if (response.success) {
        this.hideSignupModal()
        this.updateUI()
        window.showNotification("Account created successfully!", "success")
        e.target.reset()
      }
    } catch (error) {
      window.showNotification(error.message, "error")
    } finally {
      // Reset button state
      const submitBtn = e.target.querySelector('button[type="submit"]')
      submitBtn.textContent = "Sign Up"
      submitBtn.disabled = false
    }
  }

  logout() {
    const result = this.apiClient.logout()
    this.updateUI()
    window.showNotification(result.message, "info")

    // Redirect to home if on protected page
    if (window.location.pathname.includes("checkout")) {
      window.location.href = "index.html"
    }
  }

  updateUI() {
    const loginBtn = document.getElementById("loginBtn")
    const signupBtn = document.getElementById("signupBtn")
    const profileBtn = document.getElementById("profileBtn")
    const logoutBtn = document.getElementById("logoutBtn")

    const currentUser = this.apiClient.getCurrentUser()

    if (currentUser) {
      if (loginBtn) loginBtn.style.display = "none"
      if (signupBtn) signupBtn.style.display = "none"
      if (profileBtn) {
        profileBtn.style.display = "block"
        profileBtn.textContent = currentUser.username
      }
      if (logoutBtn) logoutBtn.style.display = "block"
    } else {
      if (loginBtn) loginBtn.style.display = "block"
      if (signupBtn) signupBtn.style.display = "block"
      if (profileBtn) profileBtn.style.display = "none"
      if (logoutBtn) logoutBtn.style.display = "none"
    }
  }

  showLoginModal() {
    const modal = document.getElementById("loginModal")
    if (modal) {
      modal.style.display = "block"
      document.body.style.overflow = "hidden"
    }
  }

  hideLoginModal() {
    const modal = document.getElementById("loginModal")
    if (modal) {
      modal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  }

  showSignupModal() {
    const modal = document.getElementById("signupModal")
    if (modal) {
      modal.style.display = "block"
      document.body.style.overflow = "hidden"
    }
  }

  hideSignupModal() {
    const modal = document.getElementById("signupModal")
    if (modal) {
      modal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  }

  isLoggedIn() {
    return this.apiClient.isLoggedIn()
  }

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.showNotification("Please login to continue", "warning")
      this.showLoginModal()
      return false
    }
    return true
  }
}

// Initialize auth manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.authManager = new AuthManager()
})
