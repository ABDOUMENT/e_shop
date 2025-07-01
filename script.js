// ✅ Get the logged-in user from global variable


// ✅ Redirect if not logged in
if (!user) {
  window.location.href = 'login.html';
}

let cartCount = 0;
let cartTotal = 0;

// ✅ Add to Cart
function addToCart(price) {
  cartCount++;
  cartTotal += price;

  document.getElementById("cart-count").textContent = cartCount;
  document.getElementById("cart-total").textContent = cartTotal.toFixed(2);
}

// ✅ Logout
function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}

// ✅ Navigate to product page
function viewProduct(id) {
  localStorage.setItem("selectedProduct", id);
  window.location.href = "product.html";
}

// ✅ Load products on window load
window.onload = function () {
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product";
    card.setAttribute("onclick", `viewProduct(${index})`);

    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" style="max-height: 150px; object-fit: cover;">
      <h3>${product.title}</h3>
      <p>$${product.price.toFixed(2)}</p>
      <button onclick="event.stopPropagation(); addToCart(${product.price})">Add to Cart</button>
    `;

    if (user && user.role === 'client') {
      card.innerHTML += `
        <button class="command-btn" onclick="event.stopPropagation(); openOrderModal(${index})">
          🛒 Command
        </button>
      `;
    }

    container.appendChild(card);
  });

  // ✅ Entrepreneur navbar setup
  if (user && user.role === 'entrepreneur') {
    const navbar = document.getElementById("entrepreneur-navbar");
    if (navbar) navbar.style.display = "flex";

    const addBtn = document.getElementById("add-product-btn");
    if (addBtn) {
      addBtn.onclick = () => {
        window.location.href = "entrepreneur.html";
      };
    }

    const viewOrdersBtn = document.getElementById("view-orders-btn");
    if (viewOrdersBtn) {
      viewOrdersBtn.onclick = () => {
        openOrdersModal();
      };
    }

    const downloadCSVBtn = document.getElementById("download-csv-btn");
    if (downloadCSVBtn) {
      downloadCSVBtn.onclick = downloadOrdersAsCSV;
    }
  }

  localStorage.setItem("dynamicProducts", JSON.stringify(products));
};

// ✅ CSV Download
function downloadOrdersAsCSV() {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const myOrders = orders.filter(order => order.owner === currentUser.username);

  if (myOrders.length === 0) {
    alert("You have no orders to download.");
    return;
  }

  let csv = "Product,Quantity,Address,Phone,User,Owner,Timestamp\n";
  myOrders.forEach(o => {
    csv += `"${o.product}",${o.quantity},"${o.address}","${o.phone}","${o.user}","${o.owner}","${o.timestamp}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders_${currentUser.username}.csv`;
  a.click();
}

// ✅ Order Modal
function openOrderModal(index) {
  document.getElementById("order-modal").style.display = "block";
  document.getElementById("order-product-id").value = index;
}

function closeOrderModal() {
  document.getElementById("order-modal").style.display = "none";
}

// ✅ Submit Order
document.getElementById("order-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const productId = parseInt(document.getElementById("order-product-id").value);
  const quantity = parseInt(document.getElementById("order-quantity").value);
  const address = document.getElementById("order-address").value;
  const phone = document.getElementById("order-phone").value;

  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const product = products[productId];

  const order = {
    product: product.title,
    quantity,
    address,
    phone,
    user: user.username,
    owner: product.owner || 'unknown',
    timestamp: new Date().toLocaleString()
  };

  const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  existingOrders.push(order);
  localStorage.setItem("orders", JSON.stringify(existingOrders));

  alert("✅ Order placed successfully!");
  closeOrderModal();
});

// ✅ Orders Modal (Entrepreneur)
function openOrdersModal() {
  const ordersModal = document.getElementById("orders-modal");
  const ordersList = document.getElementById("orders-list");
  const orderDetails = document.getElementById("order-details");

  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  const myOrders = allOrders.filter(order => order.owner === user.username);
  const clients = [...new Set(myOrders.map(o => o.user))];

  ordersList.innerHTML = "<strong>Clients:</strong><br>";
  orderDetails.innerHTML = "";

  if (clients.length === 0) {
    ordersList.innerHTML += "<p>No orders yet.</p>";
  }

  clients.forEach(client => {
    const btn = document.createElement("button");
    btn.textContent = client;
    btn.style.backgroundColor = "#28a745";
    btn.style.color = "white";
    btn.style.marginBottom = "6px";
    btn.style.borderRadius = "6px";
    btn.onclick = () => showOrdersForClient(client);
    ordersList.appendChild(btn);
  });

  ordersModal.style.display = "block";
}

function closeOrdersModal() {
  document.getElementById("orders-modal").style.display = "none";
}

// ✅ Show Orders for Selected Client
function showOrdersForClient(clientUsername) {
  const orderDetails = document.getElementById("order-details");
  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");

  // Filter orders for this client AND entrepreneur
  const clientOrders = allOrders.filter(
    o => o.user === clientUsername && o.owner === user.username
  );

  if (clientOrders.length === 0) {
    orderDetails.innerHTML = "<p>No orders from this client.</p>";
    return;
  }

  let html = `<strong>Orders from ${clientUsername}:</strong><ul>`;
  clientOrders.forEach((order, index) => {
    const orderIndex = allOrders.findIndex(o =>
      o.user === order.user &&
      o.owner === order.owner &&
      o.timestamp === order.timestamp &&
      o.product === order.product
    );

    html += `
      <li>
        <strong>Product:</strong> ${order.product}<br>
        <strong>Quantity:</strong> ${order.quantity}<br>
        <strong>Address:</strong> ${order.address}<br>
        <strong>Phone:</strong> ${order.phone}<br>
        <strong>Time:</strong> ${order.timestamp}<br>
        <button onclick="deleteOrder(${orderIndex}, '${clientUsername}')">🗑️ Delete</button>
        <hr>
      </li>
    `;
  });
  html += "</ul>";

  orderDetails.innerHTML = html;
}
function deleteOrder(index, clientUsername) {
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const deleted = orders.splice(index, 1);
  localStorage.setItem("orders", JSON.stringify(orders));
  alert(`Order for product "${deleted[0].product}" has been deleted.`);
  showOrdersForClient(clientUsername); // Refresh the list
}
