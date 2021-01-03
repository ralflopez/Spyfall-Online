const express = require('express');
const route = express.Router();

route.post('/', (req, res) => {
    const { username, room } = req.body;

    
});

module.exports = route;