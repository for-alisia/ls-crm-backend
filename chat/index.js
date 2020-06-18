const users = {};
const history = {};

module.exports = (io) => {
  // new connection
  io.sockets.on("connection", (socket) => {
    const socketId = socket.id;
    // user connected
    socket.on("users:connect", ({ userId, username }) => {
      console.log(`Connected user ${username} (id:${userId})`);
      users[socketId] = {
        username,
        socketId,
        userId,
        activeRoom: null,
      };
      socket.emit("users:list", Object.values(users));
      socket.broadcast.emit("users:add", users[socketId]);
    });

    // new message
    socket.on("message:add", ({ senderId, recipientId, roomId, text }) => {
      if (!history[roomId]) {
        history[roomId] = [];
      }
      if (users[roomId]) {
        Object.values(users).forEach((user) => {
          if (user.activeRoom && user.activeRoom === roomId) {
            io.to(user.socketId).emit("message:add", {
              senderId,
              recipientId,
              text,
            });
          }
        });
        history[roomId].push({ senderId, text });
      }
    });

    // history
    socket.on("message:history", ({ recipientId, userId }) => {
      const currentUserSocketId = getSocketId(recipientId);
      users[socketId].activeRoom = getSocketId(recipientId);
      if (currentUserSocketId && history[currentUserSocketId]) {
        socket.emit("message:history", history[currentUserSocketId]);
      }
    });

    // disconnect
    socket.on("disconnect", () => {
      if (users[socketId]) {
        socket.broadcast.emit("users:leave", socketId);
        delete users[socketId];
        delete history[socketId];
      }
    });
  });
};

function getSocketId(userId) {
  for (const user in users) {
    if (users.hasOwnProperty(user)) {
      if (users[user].userId === userId) {
        return users[user].socketId;
      }
    }
  }
}
