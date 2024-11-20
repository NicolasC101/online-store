# Manual de Usuario - Aplicación de Tienda en Línea

## Descripción General
La aplicación es una tienda en línea con dos roles de usuario: Administrador y Cliente. Permite a los administradores gestionar productos y a los clientes realizar compras.

## Requisitos Previos
- Node.js (versión 14 o superior)
- npm (Node Package Manager)
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## Configuración del Entorno de Desarrollo

### Paso 1: Clonar el Repositorio
```bash
git clone [URL del repositorio]
cd online-store
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Iniciar el Servidor
```bash
node server/server.js
```
El servidor se iniciará en `http://localhost:3000`

## Roles de Usuario

### Registro e Inicio de Sesión
1. Accede a `http://localhost:3000/login.html`
2. Para registrarse, utiliza el formulario de registro, o si ya tienes cuenta, clickea en "Inicia Sesión"
3. Inicia sesión con tus credenciales

#### Roles:
- **Administrador**:
  - Agregar nuevos productos
  - Ver lista de productos
- **Cliente**:
  - Navegar productos
  - Agregar productos al carrito
  - Realizar compras
  - Ver historial de compras

## Funcionalidades por Rol

### Administrador
1. Después de iniciar sesión, verás la sección de administración
2. En "Agregar Producto", completa:
   - Nombre del producto
   - Descripción
   - Precio
   - Cantidad en stock
3. Haz clic en "Agregar Producto"

### Cliente
1. Después de iniciar sesión, verás los productos disponibles
2. Puedes:
   - Agregar productos al carrito
   - Modificar cantidades
   - Eliminar productos del carrito
3. Haz clic en "Realizar Compra" para finalizar

## Proceso de Compra
1. Selecciona productos
2. Ajusta cantidades en el carrito
3. Haz clic en "Realizar Compra"
4. El sistema generará una factura y la desplegará en el historial de compras automáticamente
5. Podrás ver el historial de compras en la misma página, al final de esta.

## Consideraciones Importantes
- Verificar el stock antes de comprar
- Las credenciales son únicas para cada usuario
- Se permite cerrar sesión para cambiar de usuario

## Integridad de datos
- Error de inicio de sesión: Se verifican las credenciales
- Persistencia en usuarios, productos y compras.

## Tecnologías Utilizadas
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Autenticación: JWT
- Persistencia: Archivos JSON

## Contacto de Soporte
No hay XD.
