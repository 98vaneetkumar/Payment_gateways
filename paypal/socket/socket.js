// const { Socket } = require("socket.io");
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
    //On click user seen the all message of user one to one after click on user then seen all chat of one user //Test pass
    socket.on("users_chat_list", async (get_data) => {
      try {
        console.log("this is getdata", get_data);
        const findConstant = await Models.chatconstant.find({
          $or: [
            { senderId: get_data.senderId, reciverId: get_data.reciverId },
            { reciverId: get_data.senderId, senderId: get_data.reciverId },
          ],
        });

        if (findConstant) {
          const chatList = await Models.message.find({
            $and: [
              {
                $or: [
                  {
                    senderId: get_data.senderId,
                    reciverId: get_data.reciverId,
                  },
                  {
                    reciverId: get_data.senderId,
                    senderId: get_data.reciverId,
                  },
                  { constantId: findConstant._id },
                ],
              },
              {
                is_delete: { $ne: get_data.senderId },
              },
            ],
          });
          const count = await Models.message.countDocuments({
            $and: [
              {
                $or: [
                  {
                    senderId: get_data.senderId,
                    reciverId: get_data.reciverId,
                  },
                  {
                    reciverId: get_data.senderId,
                    senderId: get_data.reciverId,
                  },
                  { constantId: findConstant._id },
                ],
              },
              {
                is_delete: { $ne: get_data.senderId },
                is_read: 0,
              },
            ],
          });
          const success_messages = {
            success_message: "Users Chats",
            code: 200,
            unread_message_count:count,
            // getdatas: chatList,
            getdata: chatList.map((message) => {
              const isMessageFromSender =
                message.senderId.toString() === get_data.senderId;
              return {
                ...message.toObject(),
                messageSide: isMessageFromSender ? "sender" : "other",
              };
            }),
          };
          socket.emit("users_chat_list_listener", success_messages);
        } else {
          const success_message = {
            error: "Users Chat not found",
            code: 403,
          };
          socket.emit("users_chat_list_listener", success_message);
        }
      } catch (error) {
        console.log(error);
      }
    });
    //List of all user with whom sender-User do chat  //Test pass
    socket.on("user_constant_list", async (get_data) => {
      try {
        const { filter } = get_data;
        let order;
        if (filter === 1) {
          order = { createdAt: 1 }; // Sort by old to new
        } else if (filter === 2) {
          order = { createdAt: -1 }; // Sort by new to old
        }
        var where = {
          $or: [
            { senderId: get_data.senderId, is_block: { $ne: 1 } }, // Check for is_block != 1
            { reciverId: get_data.senderId, is_block: { $ne: 1 } }, // Check for is_block != 1
            { senderId: get_data.senderId, is_block: { $exists: false } }, // Check for documents without is_block field
            { reciverId: get_data.senderId, is_block: { $exists: false } }, // Check for documents without is_block field
          ],
        };

        if (filter == 3) {
          where.is_favourite = 1;
        }

        const constantList = await Models.chatconstant
          .find(where)
          .populate({
            path: "lastmessage",
            select: "senderId reciverId message message_type is_read",
            model: Models.message,
          })
          .populate({
            path: "senderId reciverId",
            select: "id name images email",
            model: Models.userModel,
          })
          .sort(order);

        const success_message = {
          success_message: "User Constant Chats List",
          code: 200,
          getdata: constantList,
        };

        socket.emit("user_constant_chat_list", success_message);
      } catch (error) {
        console.log(error);
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
    //Message read and unread //Test pass
    socket.on("read_unread", async function (get_read_status) {
      try {
        const updateResult = await Models.message.updateMany(
          {
            senderId: get_read_status.senderId,
            reciverId: get_read_status.reciverId,
            is_read: 0,
          },
          {
            $set: { is_read: 1 },
          }
        );
        console.log(updateResult, "get_read_unread");
        const get_read_unread = { is_read: 1 };
        socket.emit("read_data_status", get_read_unread);
      } catch (error) {
        console.log(error);
      }
    });
    //Delete the message //test pass 
    socket.on("delete_message", async (get_data) => {
      try {
        let deleteMessage;
        if (Array.isArray(get_data.id)) {
          // It's an array of IDs
          deleteMessage = await Models.message.deleteMany({
            $or: [
              { senderId: get_data.senderId, _id: { $in: get_data.id } },
              { reciverId: get_data.senderId, _id: { $in: get_data.id } },
            ],
          });
             //Find last message
             let lastMessage = await Models.chatconstant.findOne({
              $or: [
                { senderId: get_data.senderId, lastmessage: { $in: get_data.id }},
                { reciverId: get_data.senderId, lastmessage:{ $in: get_data.id }},
              ],
            });
            if (lastMessage) {
              //Then find last message
              let data = await Models.message.findOne(
                {},
                {},
                { sort: { time: -1 } }
              );
              //Then store last message in chatConstant
              await Models.chatconstant.updateOne(
                { _id: lastMessage._id },
                { lastmessage: data._id, date: data.date, time: data.time }
              );
            }
        } else {
          // It's a single ID
          deleteMessage = await Models.message.deleteOne({
            $or: [
              { senderId: get_data.senderId, _id: get_data.id },
              { reciverId: get_data.senderId, _id: get_data.id },
            ],
          });
          //Find last message
          let lastMessage = await Models.chatconstant.findOne({
            $or: [
              { senderId: get_data.senderId, lastmessage: get_data.id },
              { reciverId: get_data.senderId, lastmessage: get_data.id },
            ],
          });
          if (lastMessage) {
            //Then find last message
            let data = await Models.message.findOne(
              {},
              {},
              { sort: { time: -1 } }
            );
            //Then store last message in chatConstant
            await Models.chatconstant.updateOne(
              { _id: lastMessage._id },
              { lastmessage: data._id, date: data.date, time: data.time }
            );
          }
        }
        // Send success response to the client
        const success_message = {
          success_message: "Message deleted successfully",
        };
        socket.emit("delete_message_listener", success_message);
      } catch (error) {
        console.log(error);
      }
    });
    //Message send //Test pass
    socket.on("send_message", async function (data) {
      console.log("this is data in socket", data);
      try {
        let checkChatConstant = await Models.chatconstant.findOne({
          $or: [
            { senderId: data.senderId, reciverId: data.reciverId },
            { senderId: data.reciverId, reciverId: data.senderId },
          ],
        });

        if (checkChatConstant) {
          let saveMsg = await Models.message.create({
            senderId: data.senderId,
            reciverId: data.reciverId,
            message: data.message,
            message_type: data.message_type,
            constantId: checkChatConstant.id,
            date: moment().format("YYYY-MM-DD"),
            time: moment().format("LTS"),
          });

          await Models.chatconstant.updateOne(
            { _id: checkChatConstant._id },
            {
              lastmessage: saveMsg._id,
              date: moment().format("YYYY-MM-DD"),
              time: moment().format("LTS"),
            }
          );

          let getMsg = await Models.message
            .findOne({
              senderId: saveMsg.senderId,
              reciverId: saveMsg.reciverId,
              _id: saveMsg._id,
            })
            .populate([
              {
                path: "senderId",
                select: "id name images",
              },
              {
                path: "reciverId",
                select: "id name images",
              },
            ]);

          socket.emit("send_message_emit", getMsg);
        } else {
          let createChatConstant = await Models.chatconstant.create({
            senderId: data.senderId,
            reciverId: data.reciverId,
          });

          let saveMsg = await Models.message.create({
            senderId: data.senderId,
            reciverId: data.reciverId,
            message: data.message,
            message_type: data.message_type,
            constantId: createChatConstant._id,
            date: moment().format("YYYY-MM-DD"),
            time: moment().format("LTS"),
          });

          await Models.chatconstant.updateOne(
            { _id: createChatConstant._id },
            {
              lastmessage: saveMsg._id,
              date: moment().format("YYYY-MM-DD"),
              time: moment().format("LTS"),
            }
          );

          let getMsg = await Models.message
            .findOne({
              senderId: data.senderId,
              reciverId: data.reciverId,
              _id: saveMsg._id,
            })
            .populate([
              {
                path: "senderId",
                select: "id name images",
              },
              {
                path: "reciverId",
                select: "id name images",
              },
            ]);

          socket.emit("send_message_emit", getMsg);
        }
      } catch (error) {
        console.error(error);
      }
    });
    //clear chat //Test pass
    socket.on("clear_chat", async (get_data) => {
      try {
        // Find the message to be clear
        const getMessage = await Models.message.find({
          $or: [
            { senderId: get_data.senderId },
            { reciverId: get_data.senderId },
          ],
          is_delete: { $exists: false },
        });
        if (getMessage) {
          // Update the message's deletedId if it exists
          await Models.message.updateMany(
            {
              $or: [
                { senderId: get_data.senderId },
                { reciverId: get_data.senderId },
              ],
              is_delete: { $exists: false },
            },
            { is_delete: get_data.senderId }
          );
        } else {
          // Delete the message if it doesn't exist or already marked as deleted
          await Models.message.deleteMany({
            $or: [
              { senderId: get_data.senderId },
              { reciverId: get_data.senderId },
            ],
            is_delete: { $ne: get_data.senderId },
          });
        }

        // Send success response to the client
        const success_message = {
          success_message: "Message clear successfully",
        };
        socket.emit("clear_chat_listener", success_message);
      } catch (error) {
        console.log(error);
      }
    });
    //Block user
    socket.on("block_user",async(get_data)=>{
      try {
        let criteria={
          senderID:get_data.senderID,
          reciverId:get_data.reciverId
        }
        let objToUpdate={
          is_block:1
        }
        let block=await Models.chatconstant.findOneAndUpdate(criteria,objToUpdate);
        socket.emit("block_user_listener", block);
      } catch (error) {
        console.log(error);
      }
    })
    //Report the user
    socket.on("report_message",async(get_data)=>{
      try {
        let objToSave={
          senderID:get_data.senderID,
          reciverId:get_data.reciverId,
          message:get_data.message
       }
       let saveData=await Models.ReportModel.create(objToSave);
       socket.emit("report_message_listener", saveData);
      } catch (error) {
        console.log(error);
      }
    })
    // Listen for typing event
    socket.on('typing', (data) => {
      const { senderId, receiverId } = data;
      // Broadcast typing event to the receiver
      socket.to(receiverId).emit('typing', senderId);
    });
    // Listen for stopTyping event
    socket.on('stopTyping', (data) => {
     const { senderId, receiverId } = data;
    // Broadcast stopTyping event to the receiver
    socket.to(receiverId).emit('stopTyping', senderId);
    });
  });
};
