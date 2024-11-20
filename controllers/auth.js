// controllers/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Rutas a archivos JSON
const usersPath = path.join(__dirname, '../data/users.json');

// Función para leer usuarios
const getUsers = () => {
    if (!fs.existsSync(usersPath)) {
        fs.writeFileSync(usersPath, JSON.stringify({ users: [] }));
    }
    const data = fs.readFileSync(usersPath);
    return JSON.parse(data).users;
};

// Función para guardar usuarios
const saveUsers = (users) => {
    fs.writeFileSync(usersPath, JSON.stringify({ users }, null, 2));
};

// Register route
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const users = getUsers();
    
    // Verificar si el usuario ya existe
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword, role };
    users.push(user);
    saveUsers(users);

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
        { username: user.username, role: user.role },
        'example',
        { expiresIn: '1h' }
    );
    res.json({ token });
});

module.exports = router;