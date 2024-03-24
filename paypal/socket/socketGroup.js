const Models = require("../models/index");
const moment = require("moment");
module.exports = function (io) {
  io.on("connection", (socket) => {
    // http://192.168.1.210:3000/ when from forntend side start on it give this url instead of localhost give ipV4
    console.log("connected user", socket.id);
    //Connect the user  //Test pass
    socket.on("connect_user", async function (data) {
      try {
        const socketId = socket.id;
        const checkUser = await Models.socketuser.findOne({
          userId: data.userId,
        });

        if (checkUser) {
          await Models.socketuser.updateOne(
            { userId: data.userId },
            { $set: { status: 1, socketId: socketId } }
          );
        } else {
          await Models.socketuser.create({
            userId: data.userId,
            socketId: socketId,
            status: 1,
          });
        }

        let success_msg = {
          success_msg: "connected successfully",
        };
        socket.emit("connect_user_listener", success_msg);
      } catch (error) {
        console.error(error);
      }
    });
    //Disconnect the user //Test pass
    socket.on("disconnect_user", async (connect_listener) => {
      try {
        const socket_id = socket.id;
        const check_user = await Models.socketuser.findOne({
          userId: connect_listener.userId,
        });

        if (check_user) {
          await Models.socketuser.updateOne(
            { userId: connect_listener.userId },
            { $set: { status: 0 } }
          );
        }
        const success_message = {
          success_message: "Disconnect successfully",
          socket_id,
        };
        socket.emit("disconnect_listener", success_message);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  });
};
