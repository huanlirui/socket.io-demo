import { createServer } from 'http';
import { send } from 'process';
import { Server, Socket } from 'socket.io';
import { rClient, subClient } from './../redis/index';

const ioEvents = function (io: Server) {
  io.of('/rooms').on('connection', function (socket: Socket) {
    socket.on('createRoom', async function (userInfo) {
      const rooms = (await rClient.tget('im:rooms')) || {};
      const userId = userInfo.user_id;

      if (Object.keys(rooms || {}).includes(userId)) {
        // return socket.emit("updateRoomsList", { error: "Room already exists." });
        throw new Error('房间已存在');
      }
      rooms[userId] = {
        name: userInfo.username,
        users: [userInfo],
      }; //新建房间  房间中可能有多个客服。

      await rClient.tset('im:rooms', rooms);
      // 通知该socket下的updateRoomsList更新房间列表
      socket.emit('updateRoomsList', rooms);
    });
    socket.on('updateRoomsList', async function (userInfo: object) {
      const rooms = (await rClient.tget('im:rooms')) || {};
      socket.emit('updateRoomsList', rooms);
    });
  });

  // Chatroom namespace
  io.of('/chatroom').on('connection', function (socket: Socket) {
    socket.on('join', async function (roomId: string, userInfo) {
      const rooms = (await rClient.tget('im:rooms')) || {};
      console.log('roomId', roomId);
      const userId = userInfo.user_id;
      // 当前客服所处的socket通道
      // userInfo.socket_id = socket.id;
      let currentRoom;
      // 如果房间不存在，就以当前操作者的id为房间id进行创建
      if (!roomId || rooms?.[roomId]) {
        rooms[userId] = {
          name: userInfo.username,
          users: [userInfo],
        };
        currentRoom = rooms[userId];
      } else {
        currentRoom = rooms[roomId];
      }
      if (Array.isArray(currentRoom.users)) {
        const index = currentRoom.users.findIndex((u) => u.user_id === userId);
        if (index > -1) {
          //如果当前操作者已经在此房间待过，那么就更新下 socket 而已
          currentRoom.users[index] = userInfo;
        } else {
          // 否则把自己push进该房间用户
          currentRoom.users.push(userInfo);
        }
      }
      let users = currentRoom.users;
      console.log('users', users);
      socket.join(roomId);
      //向房间内所有人发送更新通知。更新该房间成员。
      socket.emit('updateUsersList', users);
      // socket.broadcast.to(roomId).emit('updateUsersList', users);
      
      await rClient.tset('im:rooms', rooms);
    });
    socket.on('newMessage', async function (roomId: string, message: string) {
      console.log('roomId', roomId)
      console.log('message', message)
      socket.emit('addMessage',message)
      // socket.broadcast.to(roomId).emit('addMessage', message);
    });
  });
};

const init = function (app) {
  // const server = require("http").Server(app);
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*', //?❓
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
  });
  ioEvents(io);
  return server;
};
module.exports = init;
