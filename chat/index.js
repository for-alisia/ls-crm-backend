const Chat = require('../models/chat-model');
const { MSG_LIMIT } = require('../config');

const connectedUsers = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    const socketId = socket.id;
    // User connected
    socket.on('users:connect', function (data) {
      const user = { ...data, socketId, activeRoom: null };
      console.log(`user:connect: ${data.username} (userId: ${data.userId}) on socket: ${socketId}`);
      connectedUsers[socketId] = user;
      socket.emit('users:list', Object.values(connectedUsers));
      socket.broadcast.emit('users:add', user);
    });
    // User added a message
    socket.on('message:add', async function (data) {
      console.log('message:add');
      console.log(data);
      const { senderId, recipientId, text } = data;
      socket.emit('message:add', data);
      socket.broadcast.to(data.roomId).emit('message:add', data);
      // Save msg to DB
      const newMsg = new Chat({ text, senderId, recipientId });
      try {
        await newMsg.save();
      } catch (err) {
        // TODO Как здесь обрабатывать ошибки?
        console.log(err);
      }
    });
    // Send history to user
    socket.on('message:history', async function (data) {
      console.log('message:history');
      console.log(data);
      const { recipientId, userId } = data;

      try {
        const history = await Chat.find({
          $or: [
            { senderId: userId, recipientId },
            { recipientId: userId, senderId: recipientId },
          ],
        }).limit(MSG_LIMIT);

        if (history) {
          socket.emit('message:history', history);
        }
        console.log(history);
      } catch (err) {
        console.log(err);
      }
    });
    // User disconnect
    socket.on('disconnect', function (data) {
      delete connectedUsers[socketId];
      socket.broadcast.emit('users:leave', socketId);
    });
  });
};
