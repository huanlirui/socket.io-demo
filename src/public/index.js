const socket = io('/rooms');
const roomContainer = document.getElementById('room-container');
const roomInput = document.getElementById('roomInput');
addRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // const roomName = roomInput.value;
  let userInfo = {
    user_id: genID(),
    username: '客户' + genID(),
  };
  socket.emit('createRoom', userInfo);
});
socket.on('updateRoomsList', (data) => {
  console.log('data', data);
  console.log('data', Object.values(data));
  roomContainer.innerHTML = '';
  Object.values(data).forEach((item) => {
    appendRoom(item.name ? item.name : '未命名房间');
  });
});
function appendRoom(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  roomContainer.append(messageElement);
}
function genID() {
  return Number(Math.random().toString().substr(3, 6) + Date.now()).toString(36);
}
