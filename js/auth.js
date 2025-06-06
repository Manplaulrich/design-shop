// Authentication functionality
class AuthManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null
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
      loginBtn.addEventListener("click", () => this.showLoginModal())
    }

    if (signupBtn) {
      signupBtn.addEventListener("click", () => this.showSignupModal())
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout())
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

  handleLogin(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get("email") || e.target.querySelector('input[type="email"]').value
    const password = formData.get("password") || e.target.querySelector('input[type="password"]').value

    // Simulate login (in real app, this would be an API call)
    if (email && password) {
      const user = {
        id: Date.now(),
        email: email,
        name: email.split("@")[0],
        loginTime: new Date().toISOString(),
      }

      this.currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))

      this.hideLoginModal()
      this.updateUI()
      showNotification("Login successful!", "success")

      // Update global currentUser variable
      window.currentUser = this.currentUser
    } else {
      showNotification("Please fill in all fields", "error")
    }
  }

  handleSignup(e) {
    e.preventDefault()
    const inputs = e.target.querySelectorAll("input")
    const name = inputs[0].value
    const email = inputs[1].value
    const password = inputs[2].value
    const confirmPassword = inputs[3].value

    if (!name || !email || !password || !confirmPassword) {
      showNotification("Please fill in all fields", "error")
      return
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match", "error")
      return
    }

    if (password.length < 6) {
      showNotification("Password must be at least 6 characters", "error")
      return
    }

    // Simulate signup (in real app, this would be an API call)
    const user = {
      id: Date.now(),
      name: name,
      email: email,
      signupTime: new Date().toISOString(),
    }

    this.currentUser = user
    localStorage.setItem("currentUser", JSON.stringify(user))

    this.hideSignupModal()
    this.updateUI()
    showNotification("Account created successfully!", "success")

    // Update global currentUser variable
    window.currentUser = this.currentUser
  }

  logout() {
    this.currentUser = null
    localStorage.removeItem("currentUser")
    this.updateUI()
    showNotification("Logged out successfully", "info")

    // Update global currentUser variable
    window.currentUser = null

    // Redirect to home page if on a protected page
    if (window.location.pathname.includes("checkout")) {
      window.location.href = "index.html"
    }
  }

  updateUI() {
    const loginBtn = document.getElementById("loginBtn")
    const signupBtn = document.getElementById("signupBtn")
    const profileBtn = document.getElementById("profileBtn")
    const logoutBtn = document.getElementById("logoutBtn")

    if (this.currentUser) {
      if (loginBtn) loginBtn.style.display = "none"
      if (signupBtn) signupBtn.style.display = "none"
      if (profileBtn) {
        profileBtn.style.display = "block"
        profileBtn.textContent = this.currentUser.name
      }
      if (logoutBtn) logoutBtn.style.display = "block"
    } else {
      if (loginBtn) loginBtn.style.display = "block"
      if (signupBtn) signupBtn.style.display = "block"
      if (profileBtn) profileBtn.style.display = "none"
      if (logoutBtn) logoutBtn.style.display = "none"
    }
  }

  isLoggedIn() {
    return this.currentUser !== null
  }

  requireAuth() {
    if (!this.isLoggedIn()) {
      showNotification("Please login to continue", "warning")
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
