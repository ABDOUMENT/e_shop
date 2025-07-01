const user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user || user.role !== "admin") {
  window.location.href = "login.html";
}

const adminData = document.getElementById("admin-data");

function showUsers(role) {
  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const filtered = allUsers.filter(u => u.role === role);
  
  if (filtered.length === 0) {
    adminData.innerHTML = `<p>No ${role}s found.</p>`;
    return;
  }

  let html = `<h3>${role[0].toUpperCase() + role.slice(1)}s List</h3><ul>`;
  filtered.forEach((u, i) => {
    html += `
      <li>
        ${u.username}
        <button onclick="deleteUser('${u.username}')">🗑️ Delete</button>
      </li>
    `;
  });
  html += "</ul>";
  adminData.innerHTML = html;
}

function deleteUser(username) {
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  const deletedUser = users.find(u => u.username === username);

  // Remove user from users list
  users = users.filter(u => u.username !== username);
  localStorage.setItem("users", JSON.stringify(users));

  // If the user is an entrepreneur, delete their products
  if (deletedUser && deletedUser.role === "entrepreneur") {
    let products = JSON.parse(localStorage.getItem("products") || "[]");
    products = products.filter(p => p.owner !== username);
    localStorage.setItem("products", JSON.stringify(products));
  }

  alert(`User "${username}" deleted.`);
  adminData.innerHTML = "";
}

function showProducts() {
  const products = JSON.parse(localStorage.getItem("products") || "[]");

  if (products.length === 0) {
    adminData.innerHTML = "<p>No products found.</p>";
    return;
  }

  let html = "<h3>Products List</h3><ul>";
  products.forEach((p, i) => {
    html += `
      <li>
        ${p.title} - $${p.price}
        <button onclick="deleteProduct(${i})">🗑️ Delete</button>
      </li>
    `;
  });
  html += "</ul>";
  adminData.innerHTML = html;
}

function deleteProduct(index) {
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  const removed = products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(products));
  alert(`Product "${removed[0].title}" deleted.`);
  showProducts();
}

function downloadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  if (orders.length === 0) {
    alert("No orders found.");
    return;
  }

  let csv = "Product,Quantity,Address,Phone,User,Owner,Timestamp\n";
  orders.forEach(o => {
    csv += `"${o.product}",${o.quantity},"${o.address}","${o.phone}","${o.user}","${o.owner}","${o.timestamp}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "all_orders.csv";
  a.click();
}
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
