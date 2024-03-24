// https://tsh.io/blog/how-to-write-video-chat-app-using-webrtc-and-nodejs/
// https://github.com/AgoraIO/Tools/blob/master/DynamicKey/AgoraDynamicKey/nodejs/sample/RtcTokenBuilder2Sample.js



const db = require('./models')


const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-token')

const helper = require('./helper/helpers')

const {
  Sequelize,
  QueryTypes
} = require('sequelize');
const dbFile = require('./db/db')
const Op = Sequelize.Op;

module.exports = function (io) {
  io.on('connection', (socket) => {
    socket.on('user_connect', async function (connect_listener) {
      try {

        var id_socket = socket.id
        var data = await db.socketUser.findOne({
          where: {
            userId: connect_listener.userId
          }
        })
        if (data) {
          await db.socketUser.update({
            socketId: id_socket,
            isOnline: 1,
          }, {
            where: {
              userId: connect_listener.userId
            }
          })
          var users = await db.users.update({
            isOnline: 1
          }, {
            where: {
              id: connect_listener.userId
            }
          })
        } else {
          create_socket_user = await db.socketUser.create({
            userId: connect_listener.userId,
            socketId: id_socket,
            isOnline: 1,
          })
          var users = await db.users.update({
            isOnline: 1
          }, {
            where: {
              id: connect_listener.userId
            }
          })

        }
        success_message = "User connected successfully"


        socket.emit('connect_listener', success_message)
      } catch (error) {
        console.log(">......................", error);

        throw error
      }


    });
    socket.on('disconnect_user', async function (disconnect_listener) {
      try {
        var users_delete = await db.socketUser.findOne({
          where: {
            userId: disconnect_listener.userId
          },
          raw: true
        })
        if (users_delete) {
          await db.socketUser.destroy({
            isOnline: 1,
            where: {
              userId: disconnect_listener.userId
            }
          })
          var users = await db.users.update({
            isOnline: 0
          }, {
            where: {
              id: disconnect_listener.userId
            }
          })
          success_message = "User Disconnected successfully"
          socket.emit('disconnect_listener', success_message)
        }
      } catch (error) {
        throw error
      }
    });
    socket.on('call_to_user', async function (requestdata) {
      try {
        await callToUser(requestdata);
      } catch (error) {
        throw error
      }
    });
    socket.on('call_status', async function (requestdata) {
      try {

        if (requestdata.status == 0) 
          return false;

        let checkReceiver = await db['users'].findOne({
          where: {
            id: requestdata.receiverId
          },
          raw: true
        });

        let checkSenderName = await db['users'].findOne({
          where: {
            id: requestdata.senderId
          },
          raw: true
        });
        const channelName = requestdata.senderId > requestdata.receiverId ? requestdata.receiverId + '' + requestdata.senderId : requestdata.senderId + '' + requestdata.receiverId 

        let payload = {
          title: "LoveOneFishApp",
          channelName,
          senderId: requestdata.senderId,
          receiverId: requestdata.receiverId,
          senderName: checkSenderName ? checkSenderName.username : '',
          receiverName: checkReceiver.username,
        //  senderImage: checkSenderName ? url_get + checkSenderName.image : '',
          videoToken: requestdata.videoToken,
          callType: requestdata.callType,
        };

        switch (parseInt(requestdata.status)) {
          case 1:
            payload.notificationTitle = "Call connected"
            payload.message = "Connected"
            payload.messageType = 1
            payload.status = 1
            break;

          case 2:
            payload.notificationTitle = "Call declined"
            payload.message = "Declined"
            payload.messageType = 2
            payload.status = 2

            delete payload.videoToken
            delete payload.channelName

            break;

          case 3:
            payload.notificationTitle = "Call disconnected"
            payload.message = "Disconnected"
            payload.messageType = 3
            payload.status = 3

            delete payload.videoToken
            delete payload.channelName
            break;

          case 4:
            payload.notificationTitle = `You have missed a ${requestdata.callType == 1 ? 'audio' : 'video'} call`
            payload.message = "Missed call"
            payload.messageType = 4
            payload.status = 4
            break;

          default:
            payload.notificationTitle = `You have a new call`
            payload.message = "Calling"
            payload.messageType = 0
            payload.status = 0
        }
        
        socket.emit('callStatus', payload);

        let getRecieverSocketId = await db['socketUser'].findOne({
          attributes: ['socketId'],
          where: {
            userId: requestdata.receiverId
          },
          raw: true
        });
        io.to(getRecieverSocketId.socketId).emit('callStatus', payload)
        
      } catch (error) {
        throw error
      }
    });
    async function callToUser(requestdata) {
      try {

        let checkIos = await db['users'].findOne({
          where: {
            id: requestdata.receiverId
          },
          raw: true
        });

        let getSenderName = await db['users'].findOne({
          where: {
            id: requestdata.senderId
          },
          raw: true
        });

     //   var randomtext = crypto.randomBytes(20).toString('hex');
       // var randomUid = crypto.randomBytes(10).toString('hex');
        var uid = 0

        const channelName = requestdata.senderId > requestdata.receiverId ? requestdata.receiverId + '' + requestdata.senderId : requestdata.senderId + '' + requestdata.receiverId 
        if (checkIos) {

          let payload = {

            message: "Calling",
            title: "LoveOneFish",
            channelName,
            senderId: requestdata.senderId,
            receiverId: requestdata.receiverId,
            senderName: getSenderName ? getSenderName.username : '',
            receiverName: checkIos.username,
            senderImage: getSenderName ? getSenderName.image : '',
          };

          const currentTimestamp = Math.floor(Date.now() / 1000)

          var appID = '0ed2c655987448b9be45653afb05bf20';  // live loveonefish
          var appCertificate = 'f27fa93f55b747979f7c74e0491be097';

          const expirationTimeInSeconds = 3600
          const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

          const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, privilegeExpiredTs);

          payload.videoToken = tokenA;
          payload.callType = requestdata.callType;
          payload.session_id = requestdata.session_id;
         // await db['call_history'].create(payload)

          // }
          // if(checkIos.deviceType==1){
          //   await helper.p8(checkIos.deviceToken, payload);
          // }else{

          let findReceiverSocket = await db['socketUser'].findOne({
            attributes: ['socketId'],
            where: {
              userId: requestdata.receiverId
            },
            raw: true
          });
          io.to(findReceiverSocket.socketId).emit('callToUser', payload);
          socket.emit("callToUser", payload)
          let typeCall = (requestdata.callType == 1) ? 'audio' : 'video';
          var msg = `You have a new ${typeCall} call.`

          if (checkIos.deviceType == 1) {
            var dt = checkIos.deviceToken;
          } else {
            var dt = checkIos.pushKitToken || '';
          }

          // let b_id = "com.dev.loveOneFish.voip";
          let b_id="com.dev.lofapp.voip"

          await helper.send_push_notifications(dt, checkIos.deviceType, msg, '', 7, payload, b_id);

        }

      } catch (error) {
        throw error
      }
    }





    socket.on("start_call", async (data) => {
      try {
        var receiverObj = await db.socketUsers.findOne({
          where: { userId: data.receiver_id },
        });
        var receiverDetailObj = await db.users.findOne({
          where: { id: data.receiver_id },
        });
        var senderDetailObj = await db.users.findOne({
          where: { id: data.sender_id },
        });
        const appID = "1ec4a229810345a4a7120b9044d2efb5";
        const appCertificate = "b4f8551c4cea4a0d8d0419add4998559";
        function makeid(length) {
          var result = "";
          var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          var charactersLength = characters.length;
          for (var i = 0; i < length; i++) {
            result += characters.charAt(
              Math.floor(Math.random() * charactersLength)
            );
          }
          return result;
        }

        const channelName = makeid(20);
        const uid = 0;
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        const token = RtcTokenBuilder.buildTokenWithUid(
          appID,
          appCertificate,
          channelName,
          uid,
          privilegeExpiredTs
        );

        let addHistory = await CallHistory.create({
          senderId: data.sender_id,
          recieverId: data.receiver_id,
          type: data.type,
          duration: 0,
          status: 1, //1=connected, 2=accepted, 3=disconnected, 4=missedCall, 0=calling
          token: token,
          channelName: channelName,
        });

        var device_type = receiverDetailObj.deviceType;
        console.log(device_type, "KLKLKL");
        let message = `You have ${data.type == 1 ? "voice" : "video"
          } call from ${senderDetailObj.first_name}`;
        var notification_data = {
          title: "Calling",
          push_type: 5,
          message: message,
          type: data.type,
          senderId: data.sender_id,
          senderName: senderDetailObj.first_name,
          senderImage: senderDetailObj.image,
          recieverId: data.receiver_id,
          recieverName: receiverDetailObj.first_name,
          recieverImage: receiverDetailObj.image,
          notification_type: 4,
          status: 1,
          token: token,
          channelname: channelName,
        };
        if (device_type == 0) {
          io.to(receiverObj.socketId).emit("user_call_listner", {
            senderId: data.sender_id,
            token: token,
            channelName: channelName,
            call_type: data.type,
            receiver_data: receiverDetailObj,
          });
        } else {
          if (device_type == 2) {
            var deviceToken = receiverDetailObj.voipToken;
          } else {
            var deviceToken = receiverDetailObj.deviceToken;
          }

          const collapseId = `${data.sender_id}${data.receiver_id}`;

          const notificationcreate = {
            sender_id: data.sender_id,
            recevier_Id: data.receiver_id,
            comment: "video and audio call",
            notification_type: 4,
            is_read_status: 1,
          };
          const notifications = await notification.create(notificationcreate);

          let get_message = message;
          let device_token = deviceToken;
          let device_types = device_type;
          let type = data.type;
          let senderId = data.sender_id;
          let senderName = senderDetailObj.first_name;
          let senderImage = senderDetailObj.image;
          let recieverId = data.receiver_id;
          let recieverName = receiverDetailObj.first_name;
          let recieverImage = receiverDetailObj.image;
          let notification_type = 4;
          let status = 1;
          let channelname = channelName;
          let call_type = data.type;
          let token_id = token;

          helper.send_push_notifications_audio_video(
            get_message,
            device_token,
            device_types,
            type,
            senderId,
            senderName,
            senderImage,
            recieverId,
            recieverName,
            recieverImage,
            notification_type,
            status,
            channelname,
            call_type,
            token_id
          );
        }

        console.log("Adasddasdsdasdss");
        socket.emit("start_call_listner", notification_data);
      } catch (error) {
        console.log(error, "========error=========");
      }
    });


socket.on("call_status", async (data) => {
      try {

        var callingData = await CallHistory.findOne({
          where: {
            channelName: data.channelName,
          },
        });
        if (callingData) {
          var update = await CallHistory.update(
            {
              status: data.status,
            },
            {
              where: {
                channelName: data.channelName,
              },
            }
          );

          let message = `${data.status == 2 ? "call Accepted" : "call Rejected"
            }`;
          var notification_data = {
            push_type: 6,
            message: message,
            token: data.token || "",
            status: data.status,
            channelName: data.channelName || "",
          };
          const reciever = await User.findOne({
            where: {
              id: data.recieverId,
            },
          });

          const sender = await User.findOne({
            where: {
              id: data.senderId,
            },
          });

          const payload = {
            title: "Fanflex",
            channelName: data.channelName,
            senderName: sender.first_name,
            senderImage: sender.image,
            senderId: sender.id,
            receiverId: reciever.id,
            receiverName: reciever.first_name,
            receiverImage: reciever.image,
            videoToken: data.token,
            callType: data.callType,
            notificationType: 10,
          };
          switch (data.status) {
            case 1:
              payload.title = "Call connected";
              payload.message = "Connected";
              payload.messageType = 1;
              payload.status = 1;
              break;
            case 2:
              payload.title = "Call declined";
              payload.message = "Declined";
              payload.messageType = 2;
              payload.status = 2;
              break;
            case 3:
              payload.title = "Call disconnected";
              payload.message = "Disconnected";
              payload.messageType = 3;
              payload.status = 3;
              break;
            case 4:
              payload.title = "You have missed a video call";
              payload.message = "Missed call";
              payload.messageType = 4;
              payload.status = 4;
              break;
            default:
              payload.title = "You have a new video call";
              payload.message = "Calling";
              payload.messageType = 0;
              payload.status = 0;
          }
          const collapseId = `${data.senderId}${data.recieverId}`;
          let device_type = reciever.deviceType;

          if (device_type == 1) {
            var deviceToken = reciever.deviceToken;
          } else {
            var deviceToken = reciever.voipToken;
          }
          if (device_type != 1) {
            let send_push_notification = await helper.p8(
              deviceToken,
              payload,
              collapseId
            );
          }

          if (callingData) {
            var get_id = await socketUsers.findOne({
              where: {
                userId: data.recieverId,
              },
            });
          }
          io.to(get_id.socketId).emit("acceptReject", notification_data);
          socket.emit("acceptReject", notification_data);
        }
      } catch (er) {
        console.log(er);
      }
    });
  })


}