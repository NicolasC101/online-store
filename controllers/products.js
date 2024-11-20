// controllers/products.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Rutas a archivos JSON
const productsPath = path.join(__dirname, '../data/products.json');
const purchasesPath = path.join(__dirname, '../data/purchases.json');

// Funciones auxiliares
const getProducts = () => {
    if (!fs.existsSync(productsPath)) {
        fs.writeFileSync(productsPath, JSON.stringify({ products: [] }));
    }
    const data = fs.readFileSync(productsPath);
    return JSON.parse(data).products;
};

const saveProducts = (products) => {
    fs.writeFileSync(productsPath, JSON.stringify({ products }, null, 2));
};

const getPurchases = () => {
    if (!fs.existsSync(purchasesPath)) {
        fs.writeFileSync(purchasesPath, JSON.stringify({ purchases: [] }));
    }
    const data = fs.readFileSync(purchasesPath);
    return JSON.parse(data).purchases;
};

const savePurchases = (purchases) => {
    fs.writeFileSync(purchasesPath, JSON.stringify({ purchases }, null, 2));
};

// Rutas
router.post('/add', verifyToken, verifyAdmin, (req, res) => {
    const { name, description, price, quantity } = req.body;
    
    if (!name || !description || !price || !quantity) {
        return res.status(400).json({ error: 'Todos los campos del producto son obligatorios' });
    }

    const products = getProducts();
    const product = { name, description, price, quantity };
    products.push(product);
    saveProducts(products);

    res.status(201).json({ message: 'Producto agregado exitosamente', product });
});

router.get('/list', verifyToken, (req, res) => {
    const products = getProducts();
    res.json(products);
});

// Ruta para procesar compras
router.post('/purchase', verifyToken, (req, res) => {
    try {
        const { items } = req.body;
        const products = getProducts();
        const purchases = getPurchases();
        
        console.log('Procesando compra:', items); // Para debugging
        
        // Verificar stock y actualizar productos
        for (const item of items) {
            const product = products.find(p => p.name === item.name);
            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({ error: `Stock insuficiente para ${item.name}` });
            }
            product.quantity -= item.quantity;
        }
        
        // Crear factura
        const purchase = {
            id: Date.now().toString(),
            username: req.user.username,
            date: new Date().toISOString(),
            items: items,
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        console.log('Nueva compra:', purchase); // Para debugging
        
        // Guardar cambios
        purchases.push(purchase);
        saveProducts(products);
        savePurchases(purchases);
        
        res.json({
            message: 'Compra realizada exitosamente',
            purchase: purchase
        });
    } catch (error) {
        console.error('Error en la compra:', error);
        res.status(500).json({ error: 'Error al procesar la compra' });
    }
});

// Nueva ruta para obtener historial de compras
router.get('/history', verifyToken, (req, res) => {
    const purchases = getPurchases();
    const userPurchases = purchases.filter(p => p.username === req.user.username);
    res.json(userPurchases);
});

module.exports = router;