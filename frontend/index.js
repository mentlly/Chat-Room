const chat = document.getElementById('chat');
const chatMessage = document.getElementById('chatMessage');
const createRoom = document.getElementById('createRoom');
const joinRoom = document.getElementById('joinRoom');
const roomCode = document.getElementById('roomCode');
const leaveRoom = document.getElementById('leaveRoom');
let room = getParameterByName("id") || "public";

const socket = io("/", {
    query: {
        room: room,
    }
});

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

chat.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatMessage.value) {
        socket.emit('chatMessage', chatMessage.value);
        chatMessage.value = '';
    }
});

socket.on('inbox', (msg) => {
    const elem = document.createElement('div');
    elem.id = 'text';
    elem.textContent = msg;
    document.getElementById('inbox').appendChild(elem);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('error', (status_code, msg) => {
    document.getElementById('main').remove();
    const elem = document.createElement('div');
    elem.id = status_code;
    elem.textContent = msg;
    document.body.appendChild(elem);
});

if (createRoom) {
    createRoom.addEventListener('click', async () => {
        fetch("/api/createRoom")
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(data => {
                window.location.href = data.room;
            })
    });
}

if (leaveRoom) {
    leaveRoom.addEventListener('click', () => {
        window.location.href = "/";
    });
}

if (joinRoom) {
    joinRoom.addEventListener('submit', (e) => {
        e.preventDefault();
        if (roomCode.hidden) {
            roomCode.hidden = false;
        } else {
            if (roomCode.value) {
                window.location.href = `/room?id=${roomCode.value}`
            }
        }
    });
}