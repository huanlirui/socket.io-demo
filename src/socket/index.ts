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
        name:userInfo.username,
        users: [userInfo],
      }; //新建房间  房间中可能有多个客服。

      await rClient.tset('im:rooms', rooms);
      // 通知该socket下的updateRoomsList更新房间列表
      socket.emit('updateRoomsList', rooms);
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
