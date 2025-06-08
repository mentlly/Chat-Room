const chat = document.getElementById('chat');
const chatMessage = document.getElementById('chatMessage');
const createRoom = document.getElementById('createRoom');
const joinRoom = document.getElementById('joinRoom');
const roomCode = document.getElementById('roomCode');
const leaveRoom = document.getElementById('leaveRoom');
const user = document.getElementById('user');
const userNameElement = document.getElementById('userName');
const codeRoom = document.getElementById('codeRoom');
let room = getParameterByName("id") || "public";
let userName = "";

const socket = io("/", {
    query: {
        room: room,
    }
});

if (codeRoom) {
    codeRoom.textContent = "Room Code: "+room;
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

chatMessage.addEventListener('keypress', () => {
    if (chatMessage.value.trim()) {
        if (chatMessage.className) {
            chatMessage.classList.remove('inputMsg');
        }
    }
});

userNameElement.addEventListener('keypress', () => {
    if (userNameElement.value.trim()) {
        if (userNameElement.className) {
            userNameElement.classList.remove('inputMsg');
        }
    }
});

chat.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatMessage.value) {
        socket.emit('chatMessage', userName, chatMessage.value);
        chatMessage.value = '';
    }
});

socket.on('inbox', (userName, msg) => {
    const elem = document.createElement('div');
    const elem2 = document.createElement('div');
    const inbox = document.getElementById('inbox');
    elem.id = 'text';
    elem2.id = 'users';
    elem2.textContent = userName+": ";
    elem.textContent = msg;
    inbox.appendChild(elem2);
    inbox.appendChild(elem);
    inbox.appendChild(document.createElement('br'));
    inbox.scrollTop = inbox.scrollHeight;
});

socket.on('error', (status_code, msg) => {
    if (status_code === '400') {
        if (msg === 'inputMsg') {
            alert("Input a Message");
            chatMessage.classList.add('inputMsg');
        } else if (msg === 'inputUserName') {
            alert("Enter UserName");
            userNameElement.classList.add('inputMsg');
        }
    }
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

user.addEventListener('submit', (e) => {
    e.preventDefault();
    if (userNameElement.hidden) {
            userNameElement.hidden = false;
    } else {
        if (userNameElement.value.trim()) {
            userName = userNameElement.value.trim();
            userNameElement.hidden = true;
            document.getElementById('userSubmit').value = "Change UserName";
        }
    }
});