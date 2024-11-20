// main.js (página inicial de registro y login)
// Registro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registro exitoso, redirigiendo al login...');
        window.location.href = 'login.html';
      } else {
        document.getElementById('message').innerText = data.error || 'Error al registrar';
      }
    } catch (error) {
      console.error(error);
    }
  });
}

// Inicio de sesión
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Guardamos el token en localStorage
        localStorage.setItem('token', data.token);
        alert('Inicio de sesión exitoso');
        window.location.href = 'shop.html';
      } else {
        document.getElementById('loginMessage').innerText = data.error || 'Error al iniciar sesión';
      }
    } catch (error) {
      console.error(error);
    }
  });
}