// Save users in localStorage
const users = JSON.parse(localStorage.getItem('users') || '[]');

// Handle Signup
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const role = document.getElementById('signup-role').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // ✅ Prevent creation of "admin" user
    if (username === 'admin' && password === 'admin') {
      alert("The username and password 'admin' are reserved and cannot be used.");
      return;
    }

    const userExists = users.some(u => u.username === username);
    if (userExists) {
      alert("Username already exists.");
      return;
    }

    users.push({ username, password, role });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Signup successful! Please login.');
    window.location.href = 'login.html';
  });
}

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // ✅ Admin login check
    if (username === "admin" && password === "admin") {
      const adminUser = { username: "admin", role: "admin" };
      localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
      alert("Welcome Admin!");
      window.location.href = "admin.html";
      return;
    }

    // ✅ Normal user login
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      alert('Invalid credentials.');
      return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    alert(`Welcome ${user.role}: ${user.username}`);

    if (user.role === "entrepreneur") {
      window.location.href = "entrepreneur.html";
    } else {
      window.location.href = "index.html";
    }
  });
}

