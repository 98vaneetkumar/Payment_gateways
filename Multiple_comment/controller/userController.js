const models = require("../models/index");
const Joi=require("joi")
const validation=require("../helper/comman")
const Service=require("../service/index")
const message=require("../config/message");
const bcrypt = require("bcryptjs");
const Response = require("../config/response");
const _ = require("underscore");
const PRIVATE_KEY="#$2dte53267*$&%#fhf";
const Jwt = require("jsonwebtoken");
const path = require('path');
var fs = require('fs');

module.exports={
    registrationUser:async(payloadData,req,res)=>{
        try {
            const schema=Joi.object().keys({
                email:Joi.string().email().required(),
                name:Joi.string().required(),
                password:Joi.string().required(),
                deviceToken:Joi.string()
            })
            let payload=await validation.verifyJoiSchema(payloadData,schema);
            let hashPassword=await bcrypt.hashSync(payload.password, 10);
            let objToFind={
                email:payload.email,
            }
            let checkEmailExist=await Service.userService.getUser(objToFind)
            let objSave={}
            if (_.has(payloadData, "name") && payloadData.name != "") objSave.name = payload.name;
            if (_.has(payloadData, "email") && payloadData.email != "") objSave.email = payload.email;
            if (_.has(payloadData, "password") && payloadData.password != "") objSave.password = hashPassword;
            if (_.has(payloadData, "deviceToken") && payloadData.deviceToken != "") objSave.deviceToken = payload.deviceToken;
            
            if(!checkEmailExist){
                let respone= await Service.userService.saveData(objSave)
                let data=await Service.userService.getUser({id:respone.id})
                return data
            }
            if(checkEmailExist) return Response.error_msg.alreadyExist
        } catch (error) {
            throw error
        }
    },
    login:async(payloadData,req,res)=>{
        try {
            let schema=Joi.object().keys({
                email:Joi.string().required(),
                password:Joi.string().required(),
                deviceToken:Joi.string().required(),
                platformType:Joi.string().required()
               })
               let payload=await validation.verifyJoiSchema(payloadData,schema)
               let userDetails=await Service.userService.getUser({email:payload.email})
               if(!userDetails) return Response.error_msg.emailAndPasswordNotFound;
               var comparePass = await bcrypt.compare(payload.password, userDetails.password);
               if (!comparePass) throw response.error_msg.passwordNotMatch;
               let tokenData={
                id:userDetails.id,
                email:userDetails.email
               }
               let objToSave={}
               if (_.has(payloadData, "deviceToken") && payloadData.deviceToken != "") objToSave.deviceToken = payload.deviceToken;
               if (_.has(payloadData, "platformType") && payloadData.platformType != "") objToSave.platformType = payload.platformType;

               let token=await Jwt.sign(tokenData, PRIVATE_KEY);
               delete userDetails.dataValues.password
               let response = userDetails.dataValues;
               response.token=token
               return response
        } catch (error) {
            throw error
        }
    },
    addposts:async(payloadData,req,res)=>{
        try {
            let schema=Joi.object().keys({
                post:Joi.string().required(),
                userId:Joi.string().required()
            })
            let payload=await validation.verifyJoiSchema(payloadData,schema);
            let objToSave={
                post:payload.post,
                userId:payload.userId
            }
            await Service.postService.saveData(objToSave)
            return message.success.ADDED;
        } catch (error) {
            throw error
        }
    },
    addComment:async(payloadData,req,res)=>{
        try {
           let schema=Joi.object().keys({
            comment:Joi.string().required(),
            postId:Joi.string().required(),
            commentId:Joi.string(),
            userId:Joi.string().required()
           }) 
           let payload=await validation.verifyJoiSchema(payloadData,schema)
           let objToSave={
            comment:payload.comment,
            postId:payload.postId,
            commentId:payload.commentId,
            userId:payload.userId
           }
           await Service.postService.saveCommet(objToSave)
           return message.success.ADDED
        } catch (error) {
            throw error
        }
    },
    findOuterComments:async(payloadData,req,res)=>{
        try {
            let schema=Joi.object().keys({
               postId:Joi.string().required(),
               userId:Joi.string().required()
            })
            let payload=await validation.verifyJoiSchema(payloadData,schema)
            let data = await Service.postService.findById({postId:payload.postId,commentId:null})
            return data;
        } catch (error) {
            throw error
        }
    },
    findAllInnerComments:async(payloadData,req,res)=>{
        try {
            let schema=Joi.object().keys({
                commentId:Joi.string().required(),
                userId:Joi.string().required()
            })
            let payload=await validation.verifyJoiSchema(payloadData,schema)
            let respone=await Service.postService.findComment(payload)
            return respone;
        } catch (error) {
            throw error
        }
    },
    findOneByOneInnerComments:async(payloadData,req,res)=>{
        console.log("payloadData",payloadData)
        try {
            let schema=Joi.object().keys({
                commentId:Joi.string().required()
            });
            let payload=await validation.verifyJoiSchema(payloadData,schema);
            console.log("payload",payload)
            let respone=await Service.postService.findById({commentId:payload.commentId})
            return respone
        } catch (error) {
            throw error
        }
    },
    multipleFileUpload:async(payloadData,req,res)=>{
        try {
            console.log("req.files",req.files.images)
            if(req.files&&Array.isArray(req.files.images)){
                let img=req.files.images
                for(var i=0;i<img.length;i++){
                 
                }
            }else{

            } 
            if(req.files&&Array.isArray(req.files.videos)){
                let video=req.files.videos
                for(var j=0;j<video.length;j++){
                 
                }
            }else{
                
            }
        } catch (error) {
            throw error
        }
    },
    fileDelete:async(payloadData,req,res)=>{
        try {
            //firstly find the path of message from database
          const currentDir = __dirname;
          const newDir = path.resolve(currentDir, '..'); 
          const filePathToDelete = `${newDir}/public/images/${req.body.imageName}` // Replace with your file path
          fs.unlink(filePathToDelete, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
              return;
            }
            console.log('File deleted successfully.');
          });
        } catch (error) {
          throw error
        }
      } 
} 

// fileUpload:async(payload,req,res)=>{
//     try {
//         var tmp_path = req.files.thumbnail.path;
//         var target_path = './public/images/' + req.files.thumbnail.name;
        // fs.rename(tmp_path, target_path, function(err) {
        //     if (err) throw err;
        //     fs.unlink(tmp_path, function() {
        //         if (err) throw err;
        //         console.log("target_path target_path",target_path)
        //         return true
        //     });
        // });
//     } catch (error) {
//       throw error
//     }
//   },