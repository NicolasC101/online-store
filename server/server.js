// server.js (hace las veces de app)

//Importaciones
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const productRoutes = require('../controllers/products');
const authRoutes = require('../controllers/auth'); // Importamos nuestras rutas de autenticación
                                                   // ../ indica que debes subir un nivel en la jerarquía de carpetas (desde server/ hacia online-store/).
                                                   // ./ -> directorio actual, ../ -> archivo por encima del directorio acutal (un nivel más arriba en la jerarquía)

// Middleware para parsear json
app.use(express.json());
app.use('/auth', authRoutes); // Usamos las rutas de autenticación bajo '/auth'
app.use('/products', productRoutes);
app.use(express.static('client')); // Indicamos el uso del .js y el front-end del directorio client/

/* / Ruta de prueba
app.get('/', (req, res) => {
   res.send('Wellcum tienda online');
}); */

app.listen(PORT, () =>{
    console.log(`Server escuchando en el puerto ${PORT}`);
});






