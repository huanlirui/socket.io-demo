const socketRoomList = io('/rooms');
const socketChatroom = io('/chatroom');
const roomContainer = document.getElementById('room-container');
const userContainer = document.getElementById('user-list');
const roomNameContainer = document.getElementById('room-name');
const sendForm = document.getElementById('send-container');
const sendInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container')
var userInfo = {
  user_id: 123456565656,
  username: '客户' + 126767673456,
};
var currentRoom = {};

addRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  socketRoomList.emit('createRoom', userInfo);
});
sendForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = sendInput.value;
  socketChatroom.emit('newMessage', currentRoom.roomId, message);
});

socketRoomList.emit('updateRoomsList', userInfo);
socketRoomList.on('updateRoomsList', (data) => {
  roomContainer.innerHTML = '';
  for (let key in data) {
    appendRoom(key, data[key]);
  }
});
socketChatroom.on('addMessage', (data) => {
  
  appendMessage(data);
});

socketChatroom.on('updateUsersList', (users) => {
  currentRoom.users = users;
  console.log('users', users);
  for (let value of users) {
    appendUser(value.username);
  }
});

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}
function appendUser(user) {
  const userElement = document.createElement('div');
  userElement.innerText = user;
  userContainer.append(userElement);
}
function appendRoom(key, item) {
  const messageElement = document.createElement('div');
  const buttonElement = document.createElement('input');
  buttonElement.type = 'button';
  buttonElement.value = '与' + item.name + '的聊天';
  buttonElement.addEventListener('click', joinRoom.bind(this, key, userInfo));
  messageElement.appendChild(buttonElement);
  roomContainer.append(messageElement);
}
function joinRoom(key, userInfo) {
  console.log('userInfo', userInfo);
  socketChatroom.emit('join', key, userInfo);
  currentRoom.roomId = key;
  roomNameContainer.innerText = `与${userInfo.username}的聊天`;
}

function genID() {
  return Number(Math.random().toString().substr(3, 6) + Date.now()).toString(36);
}
