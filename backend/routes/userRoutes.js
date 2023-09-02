const express = require('express');
const router = express.Router();

router.get('/users', (req, res) => {
    // Lógica para buscar usuários
    res.send('Lista de usuários');
});

module.exports = router;
