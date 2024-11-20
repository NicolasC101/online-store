// shop.js (lógica de la tienda)

// Variables globales
let userRole = '';
let cart = [];
const token = localStorage.getItem('token');

// Función para decodificar el token JWT. Necesario ya que la vista depende del rol de usuario y del token envíado.
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Verificar el rol del usuario y mostrar la interfaz correspondiente
async function initializePage() {
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const decodedToken = parseJwt(token);
    userRole = decodedToken.role;
    
    document.getElementById('userInfo').textContent = `Usuario: ${decodedToken.username}`;
    
    if (userRole === 'admin') {
        document.getElementById('adminSection').style.display = 'block';
        document.getElementById('clientSection').style.display = 'none';
    } else {
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('clientSection').style.display = 'block';
        await loadPurchaseHistory();
    }

    await loadProducts();
}

// Cargar productos desde el servidor
async function loadProducts() {
    try {
        const response = await fetch('/products/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Mostrar productos en la página
function displayProducts(products) {
    const productsDiv = document.getElementById('products');
    productsDiv.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Precio: $${product.price}</p>
            <p>Disponibles: ${product.quantity}</p>
            ${userRole === 'user' ? 
                `<button onclick="addToCart('${encodeURIComponent(JSON.stringify(product))}')">Agregar al carrito</button>` : 
                ''}
        `;
        productsDiv.appendChild(productElement);
    });
}

// Función para agregar productos al carrito
function addToCart(productString) {
    const product = JSON.parse(decodeURIComponent(productString));
    
    if (product.quantity <= 0) {
        alert('Lo sentimos, este producto está agotado');
        return;
    }

    const existingItem = cart.find(item => item.name === product.name);
    if (existingItem) {
        if (existingItem.quantity >= product.quantity) {
            alert('No hay suficiente stock disponible');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            ...product, 
            quantity: 1, 
            quantityAvailable: product.quantity - 1 
        });
    }
    
    updateCartDisplay();
    alert('Producto agregado al carrito');
}


// Actualizar la visualización del carrito
function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalDiv = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkout');
    let total = 0;
    
    cartItemsDiv.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-details">
                <span>${item.name}</span>
                <span>$${item.price} x ${item.quantity}</span>
            </div>
            <div class="cart-item-actions">
                <button onclick="updateItemQuantity('${item.name}', ${item.quantity - 1})">-</button>
                <button onclick="updateItemQuantity('${item.name}', ${item.quantity + 1})">+</button>
                <button onclick="removeFromCart('${item.name}')">Eliminar</button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    cartTotalDiv.textContent = `Total: $${total.toFixed(2)}`;
    
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}


// Menejar la cantidad de items
function updateItemQuantity(productName, newQuantity) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productName);
            return;
        }

        // Verificar si hay suficiente stock
        if (newQuantity > item.quantity + item.quantityAvailable) {
            alert('No hay suficiente stock disponible');
            return;
        }

        item.quantity = newQuantity;
        updateCartDisplay();
    }
}

async function checkout() {

    // Esta alerta ya se realiza en const checkoutButton = document.getElementById('checkout');
    /*if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }*/

    try {
        const response = await fetch('/products/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items: cart })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al procesar la compra');
        }

        const result = await response.json();
        console.log('Resultado de la compra:', result); // Para debugging
        
        // alert('¡Compra realizada con éxito!'); Esta alerta ya se realiza en const checkoutButton = document.getElementById('checkout');
        
        // Limpiar carrito
        cart = [];
        updateCartDisplay();
        
        // Recargar productos y historial
        await loadProducts();
        await loadPurchaseHistory();
        
    } catch (error) {
        console.error('Error en checkout:', error);
        alert(error.message);
    }
}

document.getElementById('checkout').addEventListener('click', checkout);

function displayInvoice(invoice) {
    const modalHtml = `
        <div id="invoiceModal" class="modal">
            <div class="modal-content">
                <h2>Factura de Compra</h2>
                <p>ID: ${invoice.id}</p>
                <p>Fecha: ${new Date(invoice.date).toLocaleString()}</p>
                <p>Cliente: ${invoice.username}</p>
                <div class="invoice-items">
                    <h3>Productos:</h3>
                    ${invoice.items.map(item => `
                        <div class="invoice-item">
                            <span>${item.name}</span>
                            <span>${item.quantity} x $${item.price}</span>
                            <span>$${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="invoice-total">
                    <strong>Total: $${invoice.total.toFixed(2)}</strong>
                </div>
                <button onclick="closeInvoiceModal()">Cerrar</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    if (modal) {
        modal.remove();
    }
}

async function loadPurchaseHistory() {
    try {
        const response = await fetch('/products/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const purchases = await response.json();
        console.log('Historial de compras:', purchases); // Para debugging
        
        const historyDiv = document.getElementById('purchaseHistory');
        historyDiv.innerHTML = '<h2>Historial de Compras</h2>';
        
        if (purchases.length === 0) {
            historyDiv.innerHTML += '<p>No hay compras realizadas</p>';
            return;
        }

        purchases.forEach(purchase => {
            const purchaseElement = document.createElement('div');
            purchaseElement.className = 'purchase-record';
            purchaseElement.innerHTML = `
                <h3>Compra del ${new Date(purchase.date).toLocaleString()}</h3>
                <p>Total: $${purchase.total.toFixed(2)}</p>
                <ul>
                    ${purchase.items.map(item => `
                        <li>${item.name} - ${item.quantity} x $${item.price}</li>
                    `).join('')}
                </ul>
            `;
            historyDiv.appendChild(purchaseElement);
        });
    } catch (error) {
        console.error('Error al cargar historial:', error);
    }
}

function displayPurchaseHistory(purchases) {
    const historyDiv = document.getElementById('purchaseHistory');
    if (!historyDiv) return;
    
    historyDiv.innerHTML = '<h3>Historial de Compras</h3>';
    
    if (purchases.length === 0) {
        historyDiv.innerHTML += '<p>No hay compras realizadas</p>';
        return;
    }
    
    purchases.forEach(purchase => {
        const purchaseElement = document.createElement('div');
        purchaseElement.className = 'purchase-item';
        purchaseElement.innerHTML = `
            <div class="purchase-header">
                <span>Fecha: ${new Date(purchase.date).toLocaleString()}</span>
                <span>Total: $${purchase.total.toFixed(2)}</span>
            </div>
            <button onclick='displayInvoice(${JSON.stringify(purchase)})'>
                Ver Factura
            </button>
        `;
        historyDiv.appendChild(purchaseElement);
    });
}

// Función para eliminar items del carrito
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartDisplay();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePage);

// Event listener para el formulario de agregar producto (solo admin)
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: Number(document.getElementById('productPrice').value),
            quantity: Number(document.getElementById('productQuantity').value)
        };

        try {
            const response = await fetch('/products/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert('Producto agregado exitosamente');
                addProductForm.reset();
                loadProducts(); // Recargar la lista de productos
            } else {
                const data = await response.json();
                alert(data.error || 'Error al agregar producto');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar producto');
        }
    });
}

// Event listener para el botón de checkout
const checkoutButton = document.getElementById('checkout');
if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        
        // Lógica para procesar la compra. Pendiente de implementar.
        alert('¡Compra realizada con éxito!');
        cart = [];
        updateCartDisplay();
    });
}

// Event listener para el botón de cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

