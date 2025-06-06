const app = require('express')();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 3000;
let existingIDs = [];

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/createRoom', async (req, res) => {
    const roomId = await createRoom();
    res.send({room: `/room?id=${roomId}`});
});

app.get('/room', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

io.on('connection', (socket) => {
    socket.join('public');
    socket.on('chatMessage', (room, msg) => {
        socket.join(room);
        io.to(room).emit('inbox', msg);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});