const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

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

app.use('/staticFiles', express.static(path.join(__dirname, '../frontend/staticFiles')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/htmlFiles/index.html'));
});

app.get('/api/createRoom', async (req, res) => {
    const roomId = await createRoom();
    res.send({room: `/room?id=${roomId}`});
});

app.get('/room', (req, res) => {
    if (existingIDs.includes(req.query.id)) {
        res.sendFile(path.join(__dirname, '../frontend/htmlFiles/room.html'));
    } else {
        res.sendFile(path.join(__dirname, '../frontend/htmlFiles/404.html'));
    }
});

io.on('connection', (socket) => {
    const room = socket.handshake.query.room;

    socket.on("disconnecting", () => {
        const rooms = Array.from(socket.rooms);
        if (rooms[1] !== 'public' && existingIDs.includes(rooms[1])) {
            if (socket.adapter.rooms.get(rooms[1])) {
                if (socket.adapter.rooms.get(rooms[1]).size === 1) {
                    existingIDs.splice(existingIDs.indexOf(rooms[1]), 1);
                }
            }
        }
    });

    if (existingIDs.includes(room)) {
        socket.join(room);
    }
    
    socket.on('chatMessage', (userName, msg) => {
        if (userName.trim()) {
            if(msg.trim()) {
                io.to(room).emit('inbox', userName, msg);
            } else {
                io.to(socket.id).emit('error', '400', 'inputMsg');
                
            }
        } else {
            io.to(socket.id).emit("error", '400', 'inputUserName');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});