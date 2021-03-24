const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socket = require('./utils/sockets');
const connectdb = require('./utils/mongodb-config');
const cors = require('cors');
const path = require('path');

connectdb();

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client', 'build')));
;}

app.get('/', (req, res) => {
    res.json('hello im spy');
})

//server
socket.addSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log('server running at port ' + PORT);
});

module.exports = server;