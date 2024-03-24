// const { Socket } = require("socket.io");
const Models = require("../models");
const moment = require("moment");
const helper = require("../helpers/helper");
const { Op, Sequelize } = require("sequelize");
// Models.message.belongsTo(Models.users, { foreignKey: 'senderId', as: 'sender' });
// Models.message.belongsTo(Models.users, { foreignKey: 'receiverId', as: 'receiver' });
// Models.chatConstants.belongsTo(Models.users, { foreignKey: 'senderId', as: 'sender' });
// Models.chatConstants.belongsTo(Models.users, { foreignKey: 'receiverId', as: 'receiver' });
// Models.chatConstants.hasOne(Models.message, { foreignKey: 'chatConstantId', as: 'lastMessageIds' });

function findMajorityAdminSold(data) {
  const adminSoldCount = data.reduce((count, entry) => {
    count[entry.adminSold] = (count[entry.adminSold] || 0) + 1;
    return count;
  }, {});

  const majorityStatus = Object.keys(adminSoldCount).reduce((majority, key) => {
    return adminSoldCount[key] > adminSoldCount[majority] ? key : majority;
  }, Object.keys(adminSoldCount)[0]);

  return { adminsold: parseInt(majorityStatus) };
}

module.exports = function (io) {
  console.log("Inside the socket");
  io.on("connection", (socket) => {
    // http://192.168.1.210:4848/ when from forntend side start on it give this url instead of localhost give ipV4
    console.log("connected user", socket.id); //This will check request is https or http if it's value is true that's means requrest is https(scure)
    //or if it is false that mean's it is http(not scure).
    console.log("socket.handshake.secure", socket.handshake.secure);
    //This return IP with port
    console.log("socket.handshake.headers.host", socket.handshake.headers.host);
    // console.log("socket",socket)
    //Connect the user  //Test pass
    socket.on("connect_user", async function (data) {
      try {
        console.log("data", data);
        if (!data.userId) {
          error_message = {
            error_message: "please enter user id first",
          };
          socket.emit("connect_user_listener", error_message);
          return;
        }
        const socketId = socket.id;
        const checkUser = await Models.socketUser.findOne({
          where: {
            userId: data.userId,
          },
        });
        if (checkUser) {
          await Models.socketUser.update(
            { isOnline: 1, socketId: socketId },
            {
              where: { userId: data.userId },
            }
          );
        } else {
          await Models.socketUser.create({
            userId: data.userId,
            socketId: socketId,
            isOnline: 1,
          });
        }

        let success_msg = {
          success_msg: "connected successfully",
        };
        socket.emit("connect_user_listener", success_msg);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
    //Test pass
    //On click user seen the all message of user one to one after click on user then seen all chat of one user //Test pass
    socket.on("users_chat_list", async (get_data) => {
      try {
        const findConstant = await Models.chatConstants.findOne({
          where: {
            [Op.or]: [
              {
                senderId: get_data.senderId,
                receiverId: get_data.receiverId,
              },
              {
                senderId: get_data.receiverId,
                receiverId: get_data.senderId,
              },
            ],
          },
          include: [
            {
              model: Models.user,
              as: "sender",
              attributes: [
                "id",
                "username",
                "firstName",
                "lastName",
                "image",
                "email",
              ],
            },
            {
              model: Models.user,
              as: "receiver",
              attributes: [
                "id",
                "username",
                "firstName",
                "lastName",
                "image",
                "email",
              ],
            },
            {
              model: Models.product,
              as: "product",
              attributes: ["id", "name", "image"],
              include: [
                {
                  model: Models.product_images,
                  required: false,
                },
                {
                  model: Models.category,
                  required: false,
                  as: "category",
                  attributes: ["id", "name", "image"],

                  include: [
                    {
                      model: Models.subCategory,
                      required: false,
                      as: "subCategory",
                      attributes: ["id", "name"],
                    },
                  ],
                },
              ],
            },
          ],
        });

        if (findConstant) {
          console.log("get_data", get_data);
          let c = await Models.message.update(
            { readStatus: 1 }, // Values to update
            {
              where: {
                senderId: get_data.senderId,
                receiverId: get_data.receiverId,
                readStatus: 0, // Additional condition for updating
              },
            }
          );
          console.log("this is update test", c);
          const chatList = await Models.message.findAll({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    {
                      senderId: get_data.senderId,
                      receiverId: get_data.receiverId,
                    },
                    {
                      receiverId: get_data.senderId,
                      senderId: get_data.receiverId,
                    },
                    { chatConstantId: findConstant.id },
                  ],
                },
                {
                  deletedId: { [Op.ne]: get_data.senderId },
                  groupId: null,
                },
              ],
            },
            include: [
              {
                model: Models.user,
                as: "sender",
                attributes: ["firstName", "lastName", "image"],
              },
              {
                model: Models.user,
                as: "receiver",
                attributes: ["firstName", "lastName", "image"],
              },
            ],
          });
          // Populate receiver's profile image;
          const count = await Models.message.count({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    {
                      [Op.and]: [
                        { senderId: get_data.senderId },
                        { receiverId: get_data.receiverId },
                      ],
                    },
                    {
                      [Op.and]: [
                        { receiverId: get_data.senderId },
                        { senderId: get_data.receiverId },
                      ],
                    },
                    { chatConstantId: findConstant.id },
                  ],
                },
                {
                  [Op.and]: [
                    { deletedId: { [Op.ne]: get_data.senderId } },
                    { readStatus: 0 },
                  ],
                },
              ],
            },
          });

          const success_message = {
            success_message: "Users Chats",
            code: 200,
            senderDetail: findConstant,
            unread_message_count: count,
            getdata: chatList.map((message) => {
              const isMessageFromSender = message.senderId == get_data.senderId;

              return {
                id: message.id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                chatConstantId: message.chatConstantId,
                message: message.message,
                readStatus: message.readStatus,
                messageType: message.messageType,
                thumbnail: message.thumbnail,
                deletedId: message.deletedId,
                image: message.image,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,
                messageside: isMessageFromSender ? "sender" : "other",
              };
            }),
          };

          socket.emit("users_chat_list_listener", success_message);
        } else {
          const success_message = {
            error: "Users Chat not found",
            code: 403,
          };
          socket.emit("users_chat_list_listener", success_message);
        }
      } catch (error) {
        throw error;
      }
    });
    //Test pass
    //List of all user with whom sender-User do chat with online status
    socket.on("user_constant_list", async (get_data) => {
      try {
        const { filter, senderId } = get_data;
        // Build the query to find chat constants
        const where = {
          [Op.or]: [{ senderId: senderId }, { receiverId: senderId }],
        };
        // Find all chat constants that match the criteria
        const constantList = await Models.chatConstants.findAll({
          where: where,
          attributes: [
            "id",
            "senderId",
            "receiverId",
            "unreadCount",
            "createdAt",
            "updatedAt",
            "onlineStatus",
          ],
          include: [
            {
              model: Models.message,
              as: "lastMessageIds",
              attributes: ["message", "messageType"],
            },
            {
              model: Models.user,
              as: "sender",
              attributes: [
                "id",
                "username",
                "firstName",
                "lastName",
                "image",
                "email",
              ],
            },
            {
              model: Models.user,
              as: "receiver",
              attributes: [
                "id",
                "username",
                "firstName",
                "lastName",
                "image",
                "email",
              ],
            },
            {
              model: Models.product,
              as: "product",
              attributes: ["id", "name", "image"],
              include: [
                {
                  model: Models.product_images,
                  required: false,
                },
                {
                  model: Models.category,
                  required: false,
                  as: "category",
                  attributes: ["id", "name", "image"],

                  include: [
                    {
                      model: Models.subCategory,
                      required: false,
                      as: "subCategory",
                      attributes: ["id", "name"],
                    },
                  ],
                },
              ],
            },
          ],
          order: [["updatedAt", "DESC"]],
        });

        // Create an array to store user IDs for whom we want to count unread message
        const userIds = constantList.map((constant) => {
          if (constant.senderId && constant.senderId == senderId) {
            return constant.receiverId != null ? constant.receiverId : null;
          } else {
            return constant.senderId != null ? constant.senderId : null;
          }
        });
        // Initialize an empty object to store unread message counts
        const unreadMessageCounts = {};
        // Loop through each user ID and count unread message
        console.log("userIds userIdsuserIds userIds userIds v", userIds);

        for (const userId of userIds) {
          const count = await Models.message.count({
            where: {
              [Op.and]: {
                [Op.or]: [
                  // { senderId: senderId ,receiverId: userId},
                  { senderId: userId, receiverId: senderId },
                ],
                readStatus: 0,
              },
            },
          });
          unreadMessageCounts[userId] = count;
          console.log(
            " unreadMessageCounts[userId]",
            (unreadMessageCounts[userId] = count)
          );
        }

        const allSocketUsers = await Models.socketUser.findAll({
          where: {
            userId: {
              [Op.ne]: get_data.senderId, // Exclude the get_data.senderId
            },
          },
        });

        // Create an object to map user IDs to their online status
        const onlineStatusMap = {};
        allSocketUsers.forEach((user) => {
          onlineStatusMap[user.userId] = user.isOnline == 1; // Set isOnline based on the value
        });
        const uniqueGetdata = constantList.filter((value, index, self) => {
          // Find the index of the first occurrence of the same senderId and receiverId
          const firstIndex = self.findIndex(
            (item) =>
              item.senderId === value.senderId &&
              item.receiverId === value.receiverId
          );
          // Keep only the first occurrence
          return index === firstIndex;
        });

        // Add unread message counts to the constantList
        uniqueGetdata.forEach((constant) => {
          const senderId = constant.senderId;
          const receiverId = constant.receiverId;
          // Determine the user ID for whom you want to count unread message
          const userId = senderId == get_data.senderId ? receiverId : senderId;
          // Check if the user ID is valid and exists in unreadMessageCounts
          if (userId !== null && unreadMessageCounts[userId] !== undefined) {
            // Add the unreadCount property to the object
            constant.unreadCount = unreadMessageCounts[userId];
          } else {
            // Handle the case where unreadMessageCounts doesn't have data for this user
            constant.unreadCount = 0;
          }
          if (userId !== null && onlineStatusMap[userId]) {
            constant.onlineStatus = true; // User is online
          } else {
            constant.onlineStatus = false; // User is offline
          }
          if (
            constant.deletedId == get_data.senderId &&
            constant.deletedLastMessageId != 0
          ) {
            constant.lastMessageId = "";
            constant.lastMessageIds
              ? (constant.lastMessageIds.message = "")
              : "";
          }
        });

        const success_message = {
          success_message: "User Constant Chats List with Unread Message Count",
          code: 200,
          getdata: uniqueGetdata,
        };

        socket.emit("user_constant_chat_list", success_message);
      } catch (error) {
        throw error;
      }
    });
    //Disconnect the user //Test pass
    socket.on("disconnect_user", async (connect_listener) => {
      try {
        const socketid = socket.id;
        const check_user = await Models.socketUser.findOne({
          where: {
            userId: connect_listener.userId, // The condition to find the socket user with a specific userId
          },
        });
        if (check_user) {
          await Models.socketUser.update(
            { isOnline: 0 }, // Values to update
            {
              where: {
                userId: connect_listener.userId, // Your condition for updating
              },
            }
          );
        }
        const success_message = {
          success_message: "Disconnect successfully",
          socketid,
        };
        socket.emit("disconnect_listener", success_message);
      } catch (error) {
        throw error;
      }
    });
    //When user close the tab or app or when the server is shutdown so auto disconnet the user on server side
    socket.on("disconnect", async function () {
      try {
        await Models.socketUser.update(
          {
            isOnline: 0,
          },
          {
            where: {
              socketId: socket.id,
            },
          }
        );
      } catch (error) {
        return error;
      }
    });
    //Message read and unread //Test pass
    socket.on("read_unread", async function (get_read_status) {
      try {
        await Models.message.update(
          { readStatus: 1 }, // Values to update
          {
            where: {
              [Op.or]: [
                {
                  senderId: get_read_status.senderId,
                  receiverId: get_read_status.receiverId,
                  readStatus: 0,
                },
                {
                  senderId: get_read_status.receiverId,
                  receiverId: get_read_status.senderId,
                  readStatus: 0,
                },
              ],
            },
          }
        );
        const senderDetail = await Models.socketUser.findOne({
          where: { userId: get_read_status.senderId },
        });
        const receiverDetail = await Models.socketUser.findOne({
          where: { userId: get_read_status.receiverId },
        });

        const get_read_unread = { readStatus: 1 };
        io.to(senderDetail.socketId).emit(
          "read_unread_listner",
          get_read_status
        );
        io.to(receiverDetail.socketId).emit(
          "read_unread_listner",
          get_read_status
        );
        // socket.emit("read_unread_listner", get_read_status);
      } catch (error) {
        throw error;
      }
    });
    //Delete the message //test pass
    socket.on("delete_message", async (get_data) => {
      try {
        console.log("getdata", get_data);
        var deleteMessage;
        if (Array.isArray(get_data.id)) {
          deleteMessage = await Models.message.destroy({
            where: {
              id: get_data.messageId, // Replace with the actual field name for the message ID
            },
          });
          //Find last message
          let lastMessageIds = await Models.chatConstants.findOne({
            where: {
              [Op.or]: [
                {
                  senderId: get_data.senderId,
                  lastMessageId: get_data.messageId,
                },
                {
                  receiverId: get_data.senderId,
                  lastMessageId: get_data.messageId,
                },
              ],
            },
          });
          if (lastMessageIds) {
            //Then find last message
            const data = await Models.message.findOne({
              where: {
                [Op.or]: [
                  {
                    senderId: lastMessageIds.senderId,
                    receiverId: lastMessageIds.receiverId,
                  },
                  {
                    senderId: lastMessageIds.receiverId,
                    receiverId: lastMessageIds.senderId,
                  },
                ],
              },
              order: [["createdAt", "DESC"]], // Sorting by the 'createdAt' field in descending order
            });
            //Then store last message in chatConstant
            await Models.chatConstants.update(
              { lastMessageId: data?.dataValues.id },
              {
                where: {
                  id: lastMessageIds?.dataValues.id,
                },
              }
            );
          }
          // Send success response to the client
          const success_message = {
            success_message: "Message deleted successfully",
          };
          socket.emit("delete_message_listener", success_message);
        } else {
          // It's a single ID
          const deleteMessage = await Models.message.destroy({
            where: {
              id: get_data.messageId, // Replace with the actual field name for the message ID
            },
          });
          //Find last message
          let lastMessageIds = await Models.chatConstants.findOne({
            where: {
              [Op.or]: [
                {
                  senderId: get_data.senderId,
                  lastMessageId: get_data.messageId,
                },
                {
                  receiverId: get_data.senderId,
                  lastMessageId: get_data.messageId,
                },
              ],
            },
          });

          if (lastMessageIds) {
            //Then find last message
            const data = await Models.message.findOne({
              where: {
                [Op.or]: [
                  {
                    senderId: lastMessageIds.senderId,
                    receiverId: lastMessageIds.receiverId,
                  },
                  {
                    senderId: lastMessageIds.receiverId,
                    receiverId: lastMessageIds.senderId,
                  },
                ],
              },
              order: [["createdAt", "DESC"]], // Sorting by the 'createdAt' field in descending order
            });

            //Then store last message in chatConstant
            await Models.chatConstants.update(
              { lastMessageId: data.dataValues.id },
              {
                where: {
                  id: lastMessageIds.dataValues.id,
                },
              }
            );
          }
        }
        // Send success response to the client
        const success_message = {
          success_message: "Message deleted successfully",
        };
        socket.emit("delete_message_listener", success_message);
      } catch (error) {
        throw error;
      }
    });
    //Message send //Test pass
    socket.on("send_message", async function (data) {
      try {
        // Check if a chat constant exists for these users
        console.log("data", data);
        const checkChatConstant = await Models.chatConstants.findOne({
          where: {
            [Op.or]: [
              {
                senderId: data.senderId,
                receiverId: data.receiverId,
                productId: data.productId,
              },
              {
                senderId: data.receiverId,
                receiverId: data.senderId,
                productId: data.productId,
              },
            ],
          },
        });

        if (checkChatConstant) {
          // Create a new message and associate it with the chat constant
          const saveMsg = await Models.message.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
            productId: data.productId,
            message: data.message,
            messageType: data.messageType,
            chatConstantId: checkChatConstant.id,
            thumbnail:
              data.messageType == 2 || data.messageType == 3
                ? data.thumbnail
                : "",
          });
          // Update the last message ID in the chat constant
          let updatedata = await Models.chatConstants.update(
            {
              lastMessageId: saveMsg.id,
              deletedLastMessageId: 0,
            },
            {
              where: {
                id: checkChatConstant.id,
              },
            }
          );
          console.log("updatedata", updatedata);

          // Retrieve the message and sender/receiver information
          const getMsg = await Models.message.findOne({
            where: {
              senderId: saveMsg.senderId,
              receiverId: saveMsg.receiverId,
              productId: saveMsg.productId,
              id: saveMsg.id,
            },
            include: [
              {
                model: Models.user,
                as: "sender",
                // attributes: ['id', 'name', 'image'],
              },
              {
                model: Models.user,
                as: "receiver",
                // attributes: ['id', 'name', 'image'],
              },
              {
                model: Models.product,
                as: "product",
                include: [
                  {
                    model: Models.product_images,
                    required: false,
                  },
                  {
                    model: Models.category,
                    required: false,
                    as: "category",
                    include: [
                      {
                        model: Models.subCategory,
                        required: false,
                        as: "subCategory",
                      },
                    ],
                  },
                ],
              },
            ],
          });

          // Emit the message to the sender's and receiver's sockets
          if (getMsg) {
            const getMsgs = getMsg;
            const getSocketId = await Models.socketUser.findOne({
              where: {
                userId: data.receiverId,
              },
            });

            if (getSocketId) {
              io.to(getSocketId.socketId).emit("send_message_emit", getMsgs);
            }

            // Send push notification to the receiver if available
            const user = await Models.user.findOne({
              where: {
                id: data.receiverId,
              },
            });

            if (
              user &&
              user.deviceToken &&
              user.userInChatRoom != data.senderId
            ) {
              let body = {
                deviceToken: user.deviceToken,
                deviceType: user.deviceType,
                message: getMsg.message,
                notificationType: 1,
                senderDetail: getMsg.sender,
                senderId: getMsg.sender.id,
                senderName: getMsg.sender.name,
                receiverId: getMsg.receiverId ? getMsg.receiverId.id : "",
                messageType: getMsg.messageType,
                data: data,
              };
              await helper.sendPushNotificationSocket(body);
            }

            // Emit the message to the sender's socket
            socket.emit("send_message_emit", getMsgs);
          }
        } else {
          // Create a new chat constant
          const createChatConstant = await Models.chatConstants.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
            productId: data.productId,
          });
          // Create a new message and associate it with the chat constant
          const saveMsg = await Models.message.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            productId: data.productId,
            messageType: data.messageType,
            chatConstantId: createChatConstant.id,
            thumbnail:
              data.messageType == 2 || data.messageType == 3
                ? data.thumbnail
                : "",
          });

          // Update the last message ID in the chat constant
          await Models.chatConstants.update(
            {
              lastMessageId: saveMsg.id,
              deletedLastMessageId: 0,
            },
            {
              where: {
                id: createChatConstant.id,
              },
            }
          );

          // Retrieve the message and sender/receiver information
          const getMsg = await Models.message.findOne({
            where: {
              senderId: saveMsg.senderId,
              receiverId: saveMsg.receiverId,
              productId: saveMsg.productId,
              id: saveMsg.id,
            },
            include: [
              {
                model: Models.user,
                as: "sender",
                // attributes: ['id', 'name', 'image'],
              },
              {
                model: Models.user,
                as: "receiver",
                // attributes: ['id', 'name', 'image'],
              },
              {
                model: Models.product,
                as: "product",
                include: [
                  {
                    model: Models.product_images,
                    required: false,
                  },
                  {
                    model: Models.category,
                    required: false,
                    as: "category",
                    include: [
                      {
                        model: Models.subCategory,
                        required: false,
                        as: "subCategory",
                      },
                    ],
                  },
                ],
              },
            ],
          });

          // Emit the message to the sender's and receiver's sockets
          if (getMsg) {
            const getMsgs = getMsg;
            const getSocketId = await Models.socketUser.findOne({
              where: {
                userId: data.receiverId,
              },
            });

            if (getSocketId) {
              io.to(getSocketId.socketId).emit("send_message_emit", getMsgs);
            }

            // Send push notification to the receiver if available
            const user = await Models.user.findOne({
              where: {
                id: data.receiverId,
              },
            });

            if (
              user &&
              user.deviceToken &&
              user.userInChatRoom != data.senderId
            ) {
              const deviceToken = user.deviceToken;
              const deviceType = user.deviceType;

              let body = {
                deviceToken: user.deviceToken,
                deviceType: user.deviceType,
                message: getMsg.message,
                notificationType: 1,
                senderDetail: getMsg.sender,
                senderId: getMsg.sender.id,
                senderName: getMsg.sender.name,
                receiverId: getMsg.receiverId ? getMsg.receiverId.id : "",
                messageType: getMsg.messageType,
                data: data,
              };
              await helper.sendPushNotificationSocket(body);
            }

            // Emit the message to the sender's socket
            socket.emit("send_message_emit", getMsgs);
          }
        }
      } catch (error) {
        throw error;
      }
    });
    socket.on("clear_chat", async (get_data) => {
      try {
        // Find all message to be cleared
        const getmessage = await Models.message.findAll({
          where: {
            [Op.or]: [
              {
                senderId: get_data.receiverId,
                receiverId: get_data.senderId,
              },
              {
                senderId: get_data.senderId,
                receiverId: get_data.receiverId,
              },
            ],
            deletedId: {
              [Op.not]: 0, // Select message with a non-null deletedId
            },
          },
        });

        if (getmessage && getmessage.length > 0) {
          // Delete message permanently if they have a non-null deletedId
          await Models.message.destroy({
            where: {
              [Op.or]: [
                {
                  senderId: get_data.receiverId,
                  receiverId: get_data.senderId,
                },
                {
                  senderId: get_data.senderId,
                  receiverId: get_data.receiverId,
                },
              ],
              deletedId: {
                [Op.not]: 0, // Select message with a non-null deletedId
              },
            },
          });
          await Models.chatConstants.update(
            { deletedId: get_data.senderId, deletedLastMessageId: 1 },
            {
              where: {
                [Op.or]: [
                  {
                    senderId: get_data.receiverId,
                    receiverId: get_data.senderId,
                  },
                  {
                    senderId: get_data.senderId,
                    receiverId: get_data.receiverId,
                  },
                ],
              },
            }
          );
        } else {
          // Update or add new message with the current sender's deletedId
          await Models.message.update(
            { deletedId: get_data.senderId },
            {
              where: {
                [Op.or]: [
                  {
                    senderId: get_data.receiverId,
                    receiverId: get_data.senderId,
                  },
                  {
                    senderId: get_data.senderId,
                    receiverId: get_data.receiverId,
                  },
                ],
                deletedId: {
                  [Op.eq]: 0, // Select message with a null deletedId
                },
              },
            }
          );
          await Models.chatConstants.update(
            { deletedId: get_data.senderId, deletedLastMessageId: 1 },
            {
              where: {
                [Op.or]: [
                  {
                    senderId: get_data.receiverId,
                    receiverId: get_data.senderId,
                  },
                  {
                    senderId: get_data.senderId,
                    receiverId: get_data.receiverId,
                  },
                ],
              },
            }
          );
        }

        // Send success response to the client
        const success_message = {
          success_message: "message cleared successfully",
        };
        socket.emit("clear_chat_listener", success_message);
      } catch (error) {
        console.error("Error clearing chat:", error);
        // Handle the error here or rethrow it if you want to propagate it further
        throw error;
      }
    });
    //Typing and stopTyping  get_data has senderId and receiverId
    socket.on("typing", async (data) => {
      try {
        const { senderId, receiverId } = data;
        const getSocketId = await Models.socketUser.findOne({
          where: {
            userId: data.receiverId,
          },
        });
        // Broadcast typing event to the receiver
        io.to(getSocketId.socketId).emit("typing", senderId);
      } catch (error) {
        throw error;
      }
    });
    // Listen for stopTyping event
    socket.on("stopTyping", async (data) => {
      try {
        const { senderId, receiverId } = data;
        const getSocketId = await Models.socketUser.findOne({
          where: {
            userId: data.receiverId,
          },
        });
        // Broadcast stopTyping event to the receiver
        io.to(getSocketId.socketId).emit("stopTyping", senderId);
      } catch (error) {
        throw error;
      }
    });
    socket.on("send_message_group", async function (data) {
      try {
        // Check if a chat constant exists for these users
        const checkChatConstant = await Models.chatConstants.findOne({
          where: {
            groupId: data.groupId,
          },
        });

        if (checkChatConstant) {
          // Create a new message and associate it with the chat constant
          const userlist = await Models.groupChatUser.findAll({
            where: { groupId: data.groupId },
          });
          let userIds = userlist.map((user) => user.userId);
          userIds = userIds.filter((userId) => userId !== data.senderId);
          const saveMsg = await Models.message.create({
            senderId: data.senderId,
            receiverId: userIds[0],
            groupId: data.groupId,
            message: data.message,
            messageType: data.messageType,
            chatConstantId: checkChatConstant.id,
            thumbnail:
              data.messageType == 2 || data.messageType == 3
                ? data.thumbnail
                : "",
          });

          // Update the last message ID in the chat constant
          let updatedata = await Models.chatConstants.update(
            {
              lastMessageId: saveMsg.id,
              deletedLastMessageId: 0,
            },
            {
              where: {
                id: checkChatConstant.id,
              },
            }
          );
          // Retrieve the message and sender/receiver information
          const getMsg = await Models.message.findOne({
            where: {
              groupId: data.groupId,
              id: saveMsg.id,
            },
            include: [
              {
                model: Models.user,
                as: "sender",
                // attributes: ['id', 'name', 'image'],
              },
              {
                model: Models.group,
                as: "group",
                include: [
                  {
                    model: Models.user,
                    required: false,
                  },
                  {
                    model: Models.groupChatUser,
                    required: false,
                    as: "groupUser",
                    include: [
                      {
                        model: Models.user,
                        required: false,
                        as: "user",
                      },
                    ],
                  },
                ],
              },
            ],
          });

          // Emit the message to the sender's and receiver's sockets
          if (getMsg) {
            const getMsgs = getMsg;
            const userlist = await Models.groupChatUser.findAll({
              where: { groupId: data.groupId },
            });
            let userIds = userlist.map((user) => user.userId);
            userIds = userIds.filter((userId) => userId !== data.senderId);
            await Models.groupMessageRead.create({
              userId: data.senderId,
              groupId: data.groupId,
              messageId: saveMsg.id,
              is_Read: 0,
            });
            for (let i = 0; i < userIds.length; i++) {
              const getSocketId = await Models.socketUser.findOne({
                where: {
                  userId: userIds[i],
                },
              });
              await Models.groupMessageRead.create({
                userId: userIds[i],
                groupId: data.groupId,
                messageId: saveMsg.id,
                is_Read: 0,
              });

              if (getSocketId) {
                io.to(getSocketId.socketId).emit("send_message_group", getMsgs);
              }

              // Send push notification to the receiver if available
              const user = await Models.user.findOne({
                where: {
                  id: userIds[i],
                },
              });

              if (
                user &&
                user.deviceToken &&
                user.userInChatRoom != data.groupId
              ) {
                let body = {
                  deviceToken: user.deviceToken,
                  deviceType: user.deviceType,
                  message: getMsg.message,
                  notificationType: 2,
                  senderDetail: getMsg.sender,
                  senderId: getMsg.sender.id,
                  senderName: getMsg.sender.firstName,
                  receiverId: getMsg,
                  messageType: getMsg.messageType,
                  data: data,
                };
                await helper.sendPushNotificationSocket(body);
              }
            }
            // Emit the message to the sender's socket
            socket.emit("send_message_group", getMsgs);
          }
        } else {
          // Create a new chat constant
          const userlist = await Models.groupChatUser.findAll({
            where: { groupId: data.groupId },
          });
          let userIds = userlist.map((user) => user.userId);
          userIds = userIds.filter((userId) => userId !== data.senderId);
          let findAdminId = await Models.user.findOne({ where: { role: 0 } });
          let adminIdHas = findAdminId.dataValues
            ? findAdminId?.dataValues?.id
            : findAdminId.id;
          const createChatConstant = await Models.chatConstants.create({
            senderId: data.senderId,
            receiverId: data.senderId == adminIdHas ? userIds[0] : adminIdHas,
            groupId: data.groupId,
          });
          // Create a new message and associate it with the chat constant
          const saveMsg = await Models.message.create({
            senderId: data.senderId,
            receiverId: userIds[0],
            message: data.message,
            groupId: data.groupId,
            messageType: data.messageType,
            chatConstantId: createChatConstant.id,
            thumbnail:
              data.messageType == 2 || data.messageType == 3
                ? data.thumbnail
                : "",
          });

          // Update the last message ID in the chat constant
          await Models.chatConstants.update(
            {
              lastMessageId: saveMsg.id,
              deletedLastMessageId: 0,
            },
            {
              where: {
                id: createChatConstant.id,
              },
            }
          );

          // Retrieve the message and sender/receiver information
          const getMsg = await Models.message.findOne({
            where: {
              groupId: data.groupId,
              id: saveMsg.id,
            },
            include: [
              {
                model: Models.user,
                as: "sender",
                // attributes: ['id', 'name', 'image'],
              },
              {
                model: Models.group,
                as: "group",
                include: [
                  {
                    model: Models.user,
                    required: false,
                  },
                  {
                    model: Models.groupChatUser,
                    required: false,
                    as: "groupUser",
                    include: [
                      {
                        model: Models.user,
                        required: false,
                        as: "user",
                      },
                    ],
                  },
                ],
              },
            ],
          });
          await Models.groupMessageRead.create({
            userId: data.senderId,
            groupId: data.groupId,
            messageId: saveMsg.id,
            is_Read: 0,
          });
          // Emit the message to the sender's and receiver's sockets
          if (getMsg) {
            const getMsgs = getMsg;
            const userlist = await Models.groupChatUser.findAll({
              where: { groupId: data.groupId },
            });
            let userIds = userlist.map((user) => user.userId);
            userIds = userIds.filter((userId) => userId !== data.senderId);
            for (let i = 0; i < userIds.length; i++) {
              const getSocketId = await Models.socketUser.findOne({
                where: {
                  userId: userIds[i],
                },
              });
              await Models.groupMessageRead.create({
                userId: userIds[i],
                groupId: data.groupId,
                messageId: saveMsg.id,
                is_Read: 0,
              });

              if (getSocketId) {
                io.to(getSocketId.socketId).emit("send_message_group", getMsgs);
              }

              // Send push notification to the receiver if available
              const user = await Models.user.findOne({
                where: {
                  id: userIds[i],
                },
              });

              if (
                user &&
                user.deviceToken &&
                user.userInChatRoom != data.groupId
              ) {
                let body = {
                  deviceToken: user.deviceToken,
                  deviceType: user.deviceType,
                  message: getMsg.message,
                  notificationType: 2,
                  senderDetail: getMsg.sender,
                  senderId: getMsg.sender.id,
                  senderName: getMsg.sender.name,
                  receiverId: getMsg,
                  messageType: getMsg.messageType,
                  data: data,
                };
                await helper.sendPushNotificationSocket(body);
              }
            }
            // Emit the message to the sender's socket
            socket.emit("send_message_group", getMsgs);
          }
        }
      } catch (error) {
        throw error;
      }
    });
    //On click user seen the all message of user one to one after click on user then seen all chat of one user //Test pass
    socket.on("users_chat_list_group", async (get_data) => {
      try {
        const findConstant = await Models.chatConstants.findOne({
          where: {
            groupId: get_data.groupId,
          },
          include: [
            {
              model: Models.user,
              as: "sender",
              attributes: [
                "id",
                "username",
                "firstName",
                "lastName",
                "image",
                "email",
              ],
            },
            {
              model: Models.group,
              as: "group",
              include: [
                {
                  model: Models.groupChatUser,
                  as: "groupUser",
                  include: [
                    {
                      model: Models.user,
                      as: "user",
                      attributes: [
                        "id",
                        "username",
                        "firstName",
                        "lastName",
                        "image",
                        "email",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });

        if (findConstant) {
          await Models.groupMessageRead.update(
            {
              is_Read: 1,
            },
            {
              where: {
                userId: get_data.senderId,
                groupId: get_data.groupId,
                is_Read: 0,
              },
            }
          );
          const chatList = await Models.message.findAll({
            where: {
              groupId: get_data.groupId,
              messageType: {
                [Op.ne]: 10, // [Op.ne] means "not equal"
              },
            },
            include: [
              {
                model: Models.user,
                as: "sender",
                attributes: ["firstName", "lastName", "image"],
              },
              {
                model: Models.user,
                as: "receiver",
                attributes: ["firstName", "lastName", "image"],
              },
            ],
            limit: 50,
          });

          let shareAdminSoldStatus = await Models.sharePurchase.findAndCountAll(
            {
              where: {
                shareId: findConstant?.dataValues?.group?.shareId,
              },
              raw: true,
            }
          );
          const result = findMajorityAdminSold(shareAdminSoldStatus.rows);
          console.log("result=============>", result);
          const success_message = {
            success_message: "Users Chats",
            code: 200,
            soldStatus: result,
            senderDetail: findConstant,
            chatList: chatList,
          };

          socket.emit("users_chat_list_group", success_message);
        } else {
          const success_message = {
            error: "Users Chat not found",
            code: 403,
          };
          socket.emit("users_chat_list_group", success_message);
        }
      } catch (error) {
        throw error;
      }
    });
    //List of all user with whom sender-User do chat with online status
    socket.on("user_constant_list_group", async (get_data) => {
      try {
        const { filter, senderId } = get_data;
        // Build the query to find chat constants
        // Firstly find the groupId's in which group user exists
        const groupId = await Models.groupChatUser.findAll({
          where: { userId: get_data.senderId },
        });
        const groupIds = groupId.map((user) => user.groupId);
        const uniquegroupIds = [...new Set(groupIds)];
        const constantList = await Models.chatConstants.findAll({
          where: {
            groupId: {
              [Op.in]: uniquegroupIds,
            },
          },
          include: [
            {
              model: Models.message,
              as: "lastMessageIds",
              attributes: ["message", "messageType"],
            },
            {
              model: Models.user,
              as: "sender",
              attributes: [
                "id",
                "username",
                "firstName",
                "lastName",
                "image",
                "email",
              ],
            },
            {
              model: Models.group,
              as: "group",
              include: [
                {
                  model: Models.product,
                  as: "product",
                  attributes: ["id", "name", "image"],
                  include: [
                    {
                      model: Models.product_images,
                      required: false,
                    },
                    {
                      model: Models.category,
                      required: false,
                      as: "category",
                      attributes: ["id", "name", "image"],

                      include: [
                        {
                          model: Models.subCategory,
                          required: false,
                          as: "subCategory",
                          attributes: ["id", "name"],
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Models.groupChatUser,
                  as: "groupUser",
                  include: [
                    {
                      model: Models.user,
                      as: "user",
                      attributes: [
                        "id",
                        "username",
                        "firstName",
                        "lastName",
                        "image",
                        "email",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM groupMessageRead
                        WHERE userId = '${get_data.senderId}'
                          AND groupId = chatConstants.groupId
                          AND is_Read = 0
                      )`),
                "unreadMessageCount",
              ],
            ],
          },
          order: [["updatedAt", "DESC"]],
        });

        const success_message = {
          success_message: "User Constant Chats List with Unread Message Count",
          code: 200,
          constantList: constantList,
        };

        socket.emit("user_constant_list_group", success_message);
      } catch (error) {
        throw error;
      }
    });
    socket.on("send_message_admin", async function (data) {
      try {
        console.log("data", data);

        // Check if a chat constant exists for these users
        const checkChatConstant = await Models.chatConstants.findOne({
          where: {
            [Op.or]: [
              {
                senderId: data.senderId,
                receiverId: data.receiverId,
                // productId:data.productId
              },
              {
                senderId: data.receiverId,
                receiverId: data.senderId,
                // productId:data.productId
              },
            ],
          },
        });

        if (checkChatConstant) {
          // Create a new message and associate it with the chat constant
          const saveMsg = await Models.message.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
            // productId:data.productId,
            message: data.message,
            messageType: data.messageType,
            chatConstantId: checkChatConstant.id,
            thumbnail:
              data.messageType == 2 || data.messageType == 3
                ? data.thumbnail
                : "",
          });
          // Update the last message ID in the chat constant
          let updatedata = await Models.chatConstants.update(
            {
              lastMessageId: saveMsg.id,
              deletedLastMessageId: 0,
            },
            {
              where: {
                id: checkChatConstant.id,
              },
            }
          );
          console.log("updatedata", updatedata);

          // Retrieve the message and sender/receiver information
          const getMsg = await Models.message.findOne({
            where: {
              senderId: saveMsg.senderId,
              receiverId: saveMsg.receiverId,
              // productId: saveMsg.productId,
              id: saveMsg.id,
            },
            include: [
              {
                model: Models.user,
                as: "sender",
                // attributes: ['id', 'name', 'image'],
              },
              {
                model: Models.user,
                as: "receiver",
                // attributes: ['id', 'name', 'image'],
              },
              // {
              //   model: Models.product,
              //   as: 'product',
              //   include: [
              //     {
              //       model: Models.product_images,
              //       required: false,
              //     },
              //     {
              //       model: Models.category,
              //       required: false,
              //       as: 'category',
              //       include: [
              //         {
              //           model: Models.subCategory,
              //           required: false,
              //           as: 'subCategory',
              //         }
              //       ]
              //     },
              //   ]
              // }
            ],
          });

          // Emit the message to the sender's and receiver's sockets
          if (getMsg) {
            const getMsgs = getMsg;
            const getSocketId = await Models.socketUser.findOne({
              where: {
                userId: data.receiverId,
              },
            });
            if (getSocketId) {
              io.to(getSocketId.socketId).emit(
                "send_message_admin_emit",
                getMsgs
              );
            }

            // Send push notification to the receiver if available
            const user = await Models.user.findOne({
              where: {
                id: data.receiverId,
              },
            });

            if (user && user.deviceToken) {
              let body = {
                deviceToken: user.deviceToken,
                deviceType: user.deviceType,
                message: getMsg.message,
                notificationType: 3,
                senderDetail: getMsg.sender,
                senderId: getMsg.sender.id,
                senderName: getMsg.sender.name,
                receiverId: getMsg.receiverId ? getMsg.receiverId.id : "",
                messageType: getMsg.messageType,
              };
              await helper.sendPushNotificationSocket(body);
            }

            // Emit the message to the sender's socket
            socket.emit("send_message_admin_emit", getMsgs);
          }
        } else {
          // Create a new chat constant
          const createChatConstant = await Models.chatConstants.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
            // productId:data.productId
          });
          // Create a new message and associate it with the chat constant
          const saveMsg = await Models.message.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            // productId:data.produhelperctId,
            messageType: data.messageType,
            chatConstantId: createChatConstant.id,
            thumbnail:
              data.messageType == 2 || data.messageType == 3
                ? data.thumbnail
                : "",
          });

          // Update the last message ID in the chat constant
          await Models.chatConstants.update(
            {
              lastMessageId: saveMsg.id,
              deletedLastMessageId: 0,
            },
            {
              where: {
                id: createChatConstant.id,
              },
            }
          );

          // Retrieve the message and sender/receiver information
          const getMsg = await Models.message.findOne({
            where: {
              senderId: saveMsg.senderId,
              receiverId: saveMsg.receiverId,
              // productId:saveMsg.productId,
              id: saveMsg.id,
            },
            include: [
              {
                model: Models.user,
                as: "sender",
                // attributes: ['id', 'name', 'image'],
              },
              {
                model: Models.user,
                as: "receiver",
                // attributes: ['id', 'name', 'image'],
              },
              // {
              //   model: Models.product,
              //   as: 'product',
              //   include: [
              //     {
              //       model: Models.product_images,
              //       required: false,
              //     },
              //     {
              //       model: Models.category,
              //       required: false,
              //       as: 'category',
              //       include: [
              //         {
              //           model: Models.subCategory,
              //           required: false,
              //           as: 'subCategory',
              //         }
              //       ]
              //     },
              //   ]
              // }
            ],
          });

          // Emit the message to the sender's and receiver's sockets
          if (getMsg) {
            const getMsgs = getMsg;
            const getSocketId = await Models.socketUser.findOne({
              where: {
                userId: data.receiverId,
              },
            });
            console.log("getSocketId.socketId", getSocketId);

            if (getSocketId) {
              io.to(getSocketId.socketId).emit(
                "send_message_admin_emit",
                getMsgs
              );
            }

            // Send push notification to the receiver if available
            const user = await Models.user.findOne({
              where: {
                id: data.receiverId,
              },
            });

            if (user && user.deviceToken) {
              const deviceToken = user.deviceToken;
              const deviceType = user.deviceType;

              let body = {
                deviceToken: user.deviceToken,
                deviceType: user.deviceType,
                message: getMsg.message,
                notificationType: 3,
                senderDetail: getMsg.sender,
                senderId: getMsg.sender.id,
                senderName: getMsg.sender.name,
                receiverId: getMsg.receiverId ? getMsg.receiverId.id : "",
                messageType: getMsg.messageType,
              };
              await helper.sendPushNotificationSocket(body);
            }

            // Emit the message to the sender's socket
            socket.emit("send_message_admin_emit", getMsgs);
          }
        }
      } catch (error) {
        throw error;
      }
    });
    socket.on("delete_group_message", async (get_data) => {
      try {
        const deleteMessage = await Models.message.destroy({
          where: {
            id: get_data.messageId, // Replace with the actual field name for the message ID
          },
        });
        //Find last message
        let lastMessageIds = await Models.chatConstants.findOne({
          where: {
            [Op.or]: [
              {
                senderId: get_data.senderId,
                lastMessageId: get_data.messageId,
              },
              {
                receiverId: get_data.senderId,
                lastMessageId: get_data.messageId,
              },
            ],
          },
        });

        if (lastMessageIds) {
          //Then find last message
          const data = await Models.message.findOne({
            where: {
              [Op.or]: [
                {
                  senderId: lastMessageIds.senderId,
                  receiverId: lastMessageIds.receiverId,
                },
                {
                  senderId: lastMessageIds.receiverId,
                  receiverId: lastMessageIds.senderId,
                },
              ],
            },
            order: [["createdAt", "DESC"]], // Sorting by the 'createdAt' field in descending order
          });

          //Then store last message in chatConstant
          await Models.chatConstants.update(
            { lastMessageId: data?.dataValues?.id },
            {
              where: {
                id: lastMessageIds?.dataValues?.id,
              },
            }
          );
        }
        // Send success response to the client
        const success_message = {
          success_message: "Message deleted successfully",
        };
        socket.emit("delete_group_message", success_message);
      } catch (error) {
        throw error;
      }
    });
  });
};

// Backend listerner - emmiter ===1.(connect_user,connect_user_listener (send keys -- userId)), for connect user. 2.(users_chat_list,users_chat_list_listener (send key to backend--- senderId,receiverId)), for seen single user all messsage
// 3.(user_constant_list,user_constant_chat_list (send Key to backend----senderId)),List of all user with whom sender-User do chat. 4(disconnect_user,disconnect_listener (send Key to backend----senderId)),for discount the user
// 5.(read_unread,read_data_status) for read or unread the message. 6 .(delete_message,delete_message_listener) delete permanetly message
// 7.(send_message,send_message_emit,(send Key to backend----senderId,receiverId,message,message_type)) for send the message. 8.(clear_chat,clear_chat_listener) for clear the chat senderId and receiverId. 9.(block_user,block_user_listener) for block the user
// 10.(typing,typing) for typing. 11.(stopTyping,stopTyping) for stop typing.
// soket emit and listner
