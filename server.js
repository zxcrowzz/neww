const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { ExpressPeerServer } = require('peer');
const { v4: uuidV4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const peerServer = ExpressPeerServer(server, {
    path: '/peerjs'
});

app.use('/peerjs', peerServer);
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    res.sendFile(__dirname + '/public/room.html');
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

server.listen(process.env.PORT || 3000);
