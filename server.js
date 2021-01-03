const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socket = require('./utils/sockets');
const connectdb = require('./utils/mongodb-config');

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//server
socket.addSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log('server running');
});

module.exports = server;