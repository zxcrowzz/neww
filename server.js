const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { ExpressPeerServer } = require('peer');
const { v4: uuidV4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    transports: ['websocket'],
    upgrade: false
});

// Initialize Peer Server
const peerServer = ExpressPeerServer(server, {
    path: '/peerjs'
});

// Middleware
app.use('/peerjs', peerServer);
app.use(express.static('public'));

// Redirect to a new room
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

// Serve the room page
app.get('/:room', (req, res) => {
    res.sendFile(`${__dirname}/public/room.html`);
});

// Socket.io connection handling
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        // Handle user disconnection
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
