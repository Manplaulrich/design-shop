// API Client for Frontend-Backend Communication
class APIClient {
  constructor() {
    // Update this URL to match your XAMPP setup
    this.baseURL = "http://localhost/BACKEND/api"
    this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null
  }

  // Helper method for making HTTP requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      console.log("Making request to:", url)
      console.log("Request config:", config)

      const response = await fetch(url, config)

      // Get response text first to check if it's JSON
      const responseText = await response.text()
      console.log("Raw response:", responseText)

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        console.error("Response text:", responseText)
        throw new Error("Server returned invalid JSON. Check server configuration.")
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await this.makeRequest("/test.php")
      return response
    } catch (error) {
      throw new Error("Failed to connect to API: " + error.message)
    }
  }

  // User Registration
  async register(userData) {
    try {
      // Validate input before sending
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error("All fields are required")
      }

      const response = await this.makeRequest("/auth/register.php", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      if (response.success) {
        // Auto-login after successful registration
        this.currentUser = response.user
        localStorage.setItem("currentUser", JSON.stringify(response.user))
      }

      return response
    } catch (error) {
      throw error
    }
  }

  // User Login
  async login(credentials) {
    try {
      // Validate input before sending
      if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required")
      }

      const response = await this.makeRequest("/auth/login.php", {
        method: "POST",
        body: JSON.stringify(credentials),
      })

      if (response.success) {
        this.currentUser = response.user
        localStorage.setItem("currentUser", JSON.stringify(response.user))
      }

      return response
    } catch (error) {
      throw error
    }
  }

  // User Logout
  logout() {
    this.currentUser = null
    localStorage.removeItem("currentUser")
    return {
      success: true,
      message: "Logged out successfully",
    }
  }

  // Get User Profile
  async getUserProfile(userId) {
    try {
      const response = await this.makeRequest(`/user/profile.php?id=${userId}`)
      return response
    } catch (error) {
      throw error
    }
  }

  // Update User Profile
  async updateUserProfile(userData) {
    try {
      const response = await this.makeRequest("/user/profile.php", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      if (response.success) {
        // Update current user data
        this.currentUser = { ...this.currentUser, ...response.user }
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
      }

      return response
    } catch (error) {
      throw error
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }
}

// Create global API client instance
window.apiClient = new APIClient()

// Enhanced notification function
window.showNotification = (message, type = "success") => {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 3000;
    animation: slideInRight 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    max-width: 300px;
  `

  // Set background color based on type
  switch (type) {
    case "success":
      notification.style.background = "#27ae60"
      break
    case "error":
      notification.style.background = "#e74c3c"
      break
    case "warning":
      notification.style.background = "#f39c12"
      break
    case "info":
      notification.style.background = "#3498db"
      break
    default:
      notification.style.background = "#27ae60"
  }

  document.body.appendChild(notification)

  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 5000)
}

// Test API connection on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const testResult = await window.apiClient.testConnection()
    console.log("API Connection Test:", testResult)
    window.showNotification("API connected successfully!", "success")
  } catch (error) {
    console.error("API Connection Failed:", error)
    window.showNotification("Failed to connect to server: " + error.message, "error")
  }
})
