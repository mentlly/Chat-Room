const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
//const helmet = require('helmet');
//app.use(helmet());

const PORT = 3000;
let existingIDs = ['public'];

async function createRoom() {
    const getRandomLetters = (length = 1) => Array(length).fill().map(e => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
    const getRandomDigits = (length = 1) => Array(length).fill().map(e => Math.floor(Math.random() * 10)).join('');
    const generateUniqueID = () => {
        let id = getRandomLetters(2) + getRandomDigits(4);
        while (existingIDs.includes(id)) id = getRandomLetters(2) + getRandomDigits(4);
        return id;
    };
    const newID = generateUniqueID();
    existingIDs.push(newID);
    return newID;
}

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/createRoom', async (req, res) => {
    const roomId = await createRoom();
    res.send({room: `/room?id=${roomId}`});
});

app.get('/room', (req, res) => {
    if (req.query.id) {
        res.sendFile(path.join(__dirname, '../frontend/room.html'));
    } else {
        res.redirect('/');
    }
});

io.on('connection', (socket) => {
    const room = socket.handshake.query.room;
    if (existingIDs.includes(room)) {
        socket.join(room);
    } else {
        io.emit('error', "404", "Room Not Found");
    }
    socket.on('chatMessage', (msg) => {
        io.to(room).emit('inbox', msg);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});