const { Socket } = require("socket.io");
// const {sequelize, DataTypes, Op ,literal} = require("sequelize");
const { Op, literal } = require("sequelize");
// Model.subcategory.belongsTo(Model.cateogry,{foreignKey:'category_id',
// as:'User_data'})

const db = require("../models");

db.message.belongsTo(db.users, {
  foreignKey: "senderId",
  as: "sender_details",
});
db.message.belongsTo(db.users, {
  foreignKey: "reciverId",
  as: "reciever_details",
});

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("connected user", socket.id);

    socket.on("connect_user", async function (data) {
      try {
        const socketId = socket.id;

        const check_user = await db.socketuser.findOne({
          where: {
            userId: data.userId,
          },
        });
        if (check_user) {
          await db.socketuser.update(
            {
              status: 0,
              socketId: socketId,
            },
            {
              where: {
                userId: data.userId,
              },
            }
          );
        } else {
          await db.socketuser.create({
            userId: data.userId,
            socketId: socketId,
            status: 0,
          });
        }

        let success_msg = {
          success_msg: "connected successfully",
        };
        socket.emit("connect_user_listener", success_msg);
      } catch (error) {
        console.error(error);
        // throw error;
      }
    });

    socket.on("users_chat_list", async (get_data) => {
      console.log("🚀 ~ file: socket.js:67 ~ socket.on ~ get_data:", get_data);
      try {
        var findConstant = await db.chatconstant.findOne({
          where: {
            [Op.or]: [
              { senderId: get_data.senderId, reciverId: get_data.reciverId },
              { reciverId: get_data.senderId, senderId: get_data.reciverId },
            ],
          },
          raw: true,
        });
        // console.log(findConstant,"tttttttttttttttttttttttttt");return
        if (findConstant) {
          let chatList = await db.message.findAll({
            attributes: ["senderId", "reciverId", "message", "message_type"],
            where: {
              // is_delete: {
              //   [Op.ne]: [get_data.senderId,],
              // },
              constantId: findConstant.id,
            },
          });

          success_message = [];
          success_message = {
            success_message: "Users Chats",
            code: 200,
            getdata: chatList,
          };
          socket.emit("users_chat_list_listener", success_message);
        } else {
          success_message = [];
          success_message = {
            error: "Users Chat not found",
            code: 403,
          };
          socket.emit("users_chat_list_listener", success_message);
        }
      } catch (error) {
        console.log(error);
      }
    });

    ////////////////chatlisting//////////////////////////////////////////
    socket.on("user_constant_list", async (get_data) => {
      try {
        const { filter } = get_data;
        const query = [
          literal("(SELECT name FROM users WHERE users.id = Receiver_user_id)"),
          "ReceiverName",
        ];
        const imgquery = [
          literal(
            "(SELECT images FROM users WHERE users.id = Receiver_user_id)"
          ),
          "Receiverimage",
        ];

        let order;
        if (filter === 1) {
          order = [["createdAt", "ASC"]]; // Sort by old to new
        } else if (filter === 2) {
          order = [["createdAt", "DESC"]]; // Sort by new to old
        }

        var where = {
          [Op.or]: [
            { senderId: get_data.senderId },
            { reciverId: get_data.senderId },
          ],
        };

        if (filter == 3) {
          where.is_favourite = 1;
        }

        const constantList = await db.chatconstant.findAll({
          attributes: {
            include: [
              [
                literal(
                  `CASE WHEN chatconstant.reciverId = ${get_data.senderId} THEN chatconstant.senderId ELSE chatconstant.reciverId END`
                ),
                "Receiver_user_id",
              ],
              query,
              imgquery,
            ],
          },

          where: where,
          order: order,
        });

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

    socket.on("disconnect_user", async (connect_listener) => {
      try {
        let socket_id = socket.id;
        let check_user = await db.socketuser.findOne({
          where: {
            userId: connect_listener.userId,
            // type: connect_listener.type
          },
        });
        if (check_user) {
          create_socket_user = await db.socketuser.update(
            {
              status: 0,
            },
            {
              where: {
                userId: connect_listener.userId,
                // type: connect_listener.type
              },
            }
          );
        }
        success_message = {
          success_message: "Disconnect successfully",
          socket_id,
        };

        socket.emit("disconnect_listener", success_message);
      } catch (error) {
        throw error;
      }
    });

    socket.on("delete_message", async (get_data) => {
      try {
        // Find the message to be deleted
        var getMessage = await db.chatconstant.findOne({
          where: {
            [Op.or]: [
              { senderId: get_data.senderId },
              { reciverId: get_data.senderId },
            ],
            id: get_data.id,
            is_delete: 0,
          },
        });

        if (getMessage) {
          // Update the message's deletedId if it exists
          await db.chatconstant.update(
            { is_delete: get_data.senderId },
            {
              where: {
                [Op.or]: [
                  { senderId: get_data.senderId },
                  { reciverId: get_data.senderId },
                ],
                id: get_data.id,
                is_delete: 0,
              },
            }
          );
        } else {
          // Delete the message if it doesn't exist or already marked as deleted
          await db.chatconstant.destroy({
            where: {
              [Op.or]: [
                { senderId: get_data.senderId },
                { reciverId: get_data.senderId },
              ],
              id: get_data.id,
              is_delete: {
                [Op.ne]: get_data.senderId,
              },
            },
          });
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
    //     socket.on("send_message", async function (data) {
    //       try {

    //         let get_chatConstant = await db.chatconstant.findOne({
    //           where: {
    //           [Op.or]: [
    //               {
    //                 senderId: data.senderId,
    //                 reciverId: data.reciverId,
    //               },
    //               {
    //                 senderId: data.reciverId,
    //                 reciverId: data.senderId,
    //               },
    //             ],
    //           },
    //         });
    // console.log
    // (get_chatConstant,"KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk")
    //         // let get_chatConstant = await db.chatconstant.findOne({
    //         //   where: {
    //         //     [Op.or]: [
    //         //       {
    //         //         senderId: data.senderId,
    //         //         receiverId: data.receiverId,
    //         //       },
    //         //       {
    //         //         senderId: data.receiverId,
    //         //         receiverId: data.senderId,
    //         //       },
    //         //     ],
    //         //   },
    //         // });

    //         if (!get_chatConstant) {
    //           let create_chatConstant = await db.chatconstant.create({
    //             senderId: data.senderId,
    //             reciverId: data.reciverId,
    //           });

    //           // let message_create = await db.chatconstant.create({
    //           //   senderId: data.senderId,
    //           //   reciverId: data.reciverId,

    //           //   lastmessage: data.lastmessage,
    //           //   is_delete: data.is_delete,
    //           // });

    //           await db.message.create({
    //             senderId: data.senderID ,
    //             receiverId: data.receiverID,
    //             message: data.message,
    //             message_type: data.message_type
    //         })
    //         } else {
    //           // let update_last_msg = await constants.update(
    //           //   {
    //           //     lastmessage: message_create.id,
    //           //   },
    //           //   {
    //           //     where: {
    //           //       [Op.or]: [
    //           //         { senderId: data.senderId, reciverId: data.reciverId },
    //           //         { senderId: data.reciverId, reciverId: data.senderId },
    //           //       ],
    //           //     },
    //           //   }
    //           // );
    //           let update_last_msg = await db.chatconstant.update(
    //             {
    //               lastmessage: message_create.id,
    //             },
    //             {
    //               where: {
    //                 [Op.or]: [
    //                   { senderId: data.senderId, reciverId: data.reciverId },
    //                   { senderId: data.reciverId, reciverId: data.senderId },
    //                 ],
    //               },
    //             }
    //           );

    //           let get_message = await messages.message.findOne({
    //             where: { id: message_create.id },
    //           });

    //           let other_user_detail = await db.socketuser.findOne({
    //             where: { userId: data.receiverID },
    //           });

    //           socket.emit("send_message_emit", data);
    //           io.to(other_user_detail.socketId).emit("send_message_emit", data);
    //         }
    //       }
    //        catch (error) {
    //         console.error(error);
    //       }

    //     });
    socket.on("send_message", async function (data) {
      db;
      try {
        // console.log(data,"dataaaaaaaaaaaaaaaaaaaaaaaaaaa");
        // return
        let check_chat_constant = await db.chatconstant.findOne({
          where: {
            [Op.or]: [
              { senderId: data.senderId, reciverId: data.reciverId },
              { senderId: data.reciverId, reciverId: data.senderId },
            ],
          },
          raw: true,
        });
        // console.log(check_chat_constant,"check_chat_constantcheck_chat_constantcheck_chat_constant")
        if (check_chat_constant) {
          // console.log("i am here in if",data);
          // return
          let save_msg = await db.message.create({
            senderId: data.senderId,
            reciverId: data.reciverId,
            message: data.message,
            message_type: data.message_type,
            constantId: check_chat_constant.id,
          });

          let update_last_msg_id = await db.chatconstant.update(
            {
              lastmessage: save_msg.id,
            },
            {
              where: { id: check_chat_constant.id },
            }
          );

          let get_message = await db.message.findOne({
            include: [
              {
                attributes: ["id", "name", "images"],
                model: db.users,
                as: "sender_details",
              },
              {
                attributes: ["id", "name", "images"],
                model: db.users,
                as: "reciever_details",
              },
            ],
            where: { id: save_msg.id },
            raw: true,
            nest: true,
          });

          socket.emit("send_message_emit", get_message);
        } else {
          let create_chatConstant = await db.chatconstant.create({
            senderId: data.senderId,
            reciverId: data.reciverId,
          });

          let save_msg = await db.message.create({
            senderId: data.senderID,
            receiverId: data.receiverID,
            message: data.message,
            message_type: data.message_type,
            constantId: create_chatConstant.id,
          });

          // let update_last_msg_id = await db.chatconstant.update({
          //   lastmessage : save_msg.id
          // },{global.admin},{
          //   where : {id : create_chatConstant.id}
          // });
          let update_last_msg_id = await db.chatconstant.update(
            {
              lastmessage: save_msg.id,
            },
            {
              where: { id: create_chatConstant.id },
            }
          );

          let get_message = await db.message.findOne({
            include: [
              {
                attributes: ["id", "name", "images"],
                model: db.users,
                as: "sender_details",
              },
              {
                attributes: ["id", "name", "images"],
                model: db.users,
                as: "reciever_details",
              },
            ],
            where: { id: save_msg.id },
            raw: true,
            nest: true,
          });

          socket.emit("send_message_emit", get_message);
        }
      } catch (error) {
        console.error(error);
      }
    });
  });
};
