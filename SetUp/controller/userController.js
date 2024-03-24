const Sequelize = require("sequelize");
const _ = require("underscore");
const moment = require("moment");
const Service = require("../service");
const message = require("../config/messages");
let Response = require("../config/response");
const Joi = require("joi");
let commonHelper = require("../helper/common");
const privateKey = "config.APP_URLS.PRIVATE_KEY_ADMIN";
const Models=require("../model");
const service = require("../service");
const profileProjection = ["id", "email", "Image", "Name", "Pronouns","Bio","phoneNumber","dateOfBirth","Gender",
,"currentLocation","location","zipCode","document","marriageCertificate","termCondition"];
const CryptoJS = require('crypto-js');
const path = require('path');
var fs = require('fs');
const mv = require('mv');

const reader = require('xlsx') 
// Replace 'yourSecretKey' with your actual secret key
const secretKey = 'yourSecretKey';

function encrypt(text) {
  const ciphertext = CryptoJS.AES.encrypt(text, secretKey);
  return ciphertext.toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}

const processExcelData = (buffer) => {
  const file = reader.read(buffer, { type: 'buffer' });
  let data = [];

  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
    temp.forEach((res) => {
      data.push(res);
    });
  }

  return data;
};
const allowedExtensions = ['.xlsx'];
const checkFileExtension = (filename) => {
  const ext = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  return allowedExtensions.includes(`.${ext}`);
};

module.exports = {
  registerUser: async (payloadData,req,res) => {
	try {
    const schema = Joi.object().keys({
			name: Joi.string().optional().allow(""),
			email: Joi.string().email().required().allow(""),
      password: Joi.string().email().optional().allow(""),
			deviceToken: Joi.string().required().allow(""),
			platformType: Joi.string().valid("IOS", "ANDROID", "WEB").optional(),
			loginType: Joi.number().valid(1, 2, 3,4).description("1 => email, 2 => fb, 3 =>gmail, 4=> apple").required(),
		});
		let payload = await commonHelper.verifyJoiSchema(payloadData, schema);
		let objToSave = {};
		let projection = ["id", "email", "isBlocked", "isEmailVerified", "loginType"];
		let criteria = {};
    if(payload&&payload.password){
      var hashPassword= await commonHelper.generateNewPassword(payload.password)
      }
		if (_.has(payloadData, "name") && payloadData.name != "") objToSave.name = payload.name;
		if (_.has(payloadData, "email") && payloadData.email != "") objToSave.email = payload.email;
    if (_.has(payloadData, "password") && payloadData.password != "") objToSave.password = hashPassword;
		if (_.has(payloadData, "deviceToken") && payloadData.deviceToken != "") objToSave.deviceToken = payload.deviceToken;
    if (_.has(payloadData, "platformType") && payloadData.platformType != "")objToSave.platformType=payload.platformType;
    if (_.has(payloadData, "loginType"))objToSave.loginType = payload.loginType;
        objToSave.lastVisit = new Date();
		let userData = await Service.userService.getUser(criteria, projection);
		if (userData && userData.isBlocked === 1) throw Response.error_msg.blockUser;
		if (userData && userData.id) {
			if( payload.loginType ===1 && userData.dataValues.loginType === 1){
				throw Response.error_msg.alreadyExist;
			}
		}
		let createUser;
		if (!userData) {
			if (payload.email) {
				let criteriaDelete = {
					"isDeleted": "0",
					"isEmailVerified": "0",
					"email": payload.email
				};
				await Service.userService.delete(criteriaDelete);
			}
			createUser = await Service.userService.saveData(objToSave);
      commonHelper.infoLogger("User Created", req.originalUrl, moment())
		}
  } catch (error) {
    commonHelper.errorLogger(error.message, req.originalUrl, moment())
    throw Response.error_msg.emailNotFound;
  }
  },
  login: async(payloadData) => {
    const schema = Joi.object().keys({
        email: Joi.string().email().max(200).required(),
        password: Joi.string().required(),
        deviceToken:Joi.string().required()
    });
    let payload = await commonHelper.verifyJoiSchema(payloadData, schema);
    let emailCriteria = {
        email: payload.email,
        isDeleted: 0
    };
    let projection = [...profileProjection];
    projection.push("password");
    let checkEmailExist = await Service.userService.getUser(emailCriteria, projection, true);
    if (checkEmailExist && checkEmailExist.id) {
        let comparePass = await commonHelper.comparePassword(payload.password, checkEmailExist.password);
        if (checkEmailExist.isBlocked === 1) throw Response.error_msg.blockUser;
        else if (!comparePass) {
            throw Response.error_msg.passwordNotMatch;
        } else {
            let tokenData = {
                email: checkEmailExist.email,
                id: checkEmailExist.id,
                Name: checkEmailExist.Name
            };
            var tokenToSend=   await Jwt.sign(tokenData, privateKey);
            var dataToSave = {
                deviceToken:req.body.deviceToken,
                accessToken: tokenToSend
            };
            let criteria={
                id:checkEmailExist.id
            }
            await service.userService.updateData(criteria,dataToSave)
            delete checkEmailExist.dataValues["password"];
            let response = {
                accessToken: tokenToSend,
                profileDetails: checkEmailExist
            };
            commonHelper.infoLogger("User Created", req.originalUrl, moment())
            return response;
        }
    } else{
      commonHelper.errorLogger(error.message, req.originalUrl, moment())
      throw Response.error_msg.emailNotFound;
    } 
  },
  updateUser: async (payloadData) => {
    const schema = Joi.object().keys({
      id: Joi.string().guid({ version: "uuidv4" }).required(),
      Image: Joi.string().optional(),
      Pronouns: Joi.string().optional(),
      Bio: Joi.string().optional(),
      phoneNumber: Joi.number().optional(),
      dateOfBirth: Joi.string().optional(),
      Gender: Joi.string().optional(),
      currentLocation: Joi.string().optional(),
      location: Joi.string().optional(),
      zipCode: Joi.number().optional(),
      document: Joi.string().optional(),
      marriageCertificate: Joi.string().optional(),
      termCondition: Joi.number().valid(0, 1).optional(),
    });

    let criteria={
        id:payload.id
    };
	let payload = await commonHelper.verifyJoiSchema(payloadData, schema);
    let objToUpdate = {};
    if (_.has(payload, "id") && payload.id != "") objToUpdate.id = payload.id;
    if (_.has(payload, "Image") && payload.Image != "") objToUpdate.Image = payload.Image;
    if (_.has(payload, "Pronouns") && payload.Pronouns != "") objToUpdate.Pronouns = payload.Pronouns;
    if (_.has(payload, "Bio") && payload.Bio != "") objToUpdate.Bio = payload.Bio;
    if (_.has(payload, "phoneNumber") && payload.phoneNumber != "") objToUpdate.phoneNumber = payload.phoneNumber;
    if (_.has(payload, "dateOfBirth") && payload.dateOfBirth != "") objToUpdate.dateOfBirth = payload.dateOfBirth;
    if (_.has(payload, "Gender") && payload.Gender != "") objToUpdate.Gender = payload.Gender;
    if (_.has(payload, "currentLocation") && payload.currentLocation != "") objToUpdate.currentLocation = payload.currentLocation;
    if (_.has(payload, "location") && payload.location != "") objToUpdate.location = payload.location;
    if (_.has(payload, "zipCode") && payload.zipCode != "") objToUpdate.zipCode = payload.zipCode;
    if (_.has(payload, "document") && payload.document != "") objToUpdate.document = payload.document;
    if (_.has(payload, "marriageCertificate") && payload.marriageCertificate != "") objToUpdate.marriageCertificate = payload.marriageCertificate;
    if (_.has(payload, "termCondition") && payload.termCondition != "") objToUpdate.termCondition = payload.termCondition;
    
    let updateProfile = await Service.userService.updateData(criteria,objToUpdate);
    if (updateProfile) {
      return message.success.UPDATED;
    } else {
      return Response.error_msg.notUpdated;
    }
  },
  getProfileById :  async(paramData) => {
    const schema = Joi.object().keys({
      id: Joi.string().guid({version: "uuidv4"}).required()
    });
    let payload = await commonHelper.verifyJoiSchema(paramData, schema);
    let criteria = {
      id: payload.id,
    };
    let profile = Service.userService.getProfile(criteria, profileProjection, true);
    if (profile) {
      return profile;
    } else {
      throw Response.error_msg.recordNotFound
    }
  },
  getAllUsers: async(payloadData) => {
    const schema = Joi.object().keys({
        id: Joi.string().optional(),
        limit: Joi.number().optional(),
        skip: Joi.number().optional(),
        sortBy: Joi.string().optional(),
        orderBy: Joi.string().optional(),
        search: Joi.string().optional().allow(""),
        isBlocked: Joi.number().optional(),
        isArchive: Joi.number().valid(0,1).optional()
    });
    let payload = await commonHelper.verifyJoiSchema(payloadData, schema);
    let result = {};
    result.count= 	await Service.baseServices.count(Models.User,payload);
    result.users = await Service.userService.getAllUser(payload, Projection, parseInt(payload.limit, 10) || 10, parseInt(payload.skip, 10) || 0);
    return result;
  },
  deleteUserAccount :  async(paramData) => {
    const schema = Joi.object().keys({
        id: Joi.string().guid({version: "uuidv4"}).required()
      });
    let payload = await commonHelper.verifyJoiSchema(paramData, schema);
    let criteria = {
        id: payload.id,
      };
    let profile = Service.userService.delete(criteria);
    if (profile) {
      return message.success.DELETED;
    } else {
      throw Response.error_msg.recordNotFound
    }
  },
  test:async(req,res)=>{
    try {
      const sensitiveData = '1234567890'; // Replace with your actual sensitive data
      const encryptedData = encrypt(sensitiveData);
      console.log('Encrypted Data:', encryptedData);
      const decryptedData = decrypt(encryptedData);
      console.log('Decrypted Data:', decryptedData);
      let r={
        encryptedData:encryptedData,
        decryptedData:decryptedData
      }
      return r;
    } catch (error) {
      throw error
    }
  },
  fileUpload:async(payload,req,res)=>{
    try {
   
      // Assuming req.files.thumbnail is the uploaded file

        var tmp_path = req.files.thumbnail.path;
        var target_path = './public/images/' + req.files.thumbnail.name;
       
        mv(tmp_path, target_path, function(err) {
            if (err) {
                console.error(err);
                res.status(500).send('File upload failed.');
            } else {
                console.log("File uploaded successfully.");
                // Do further processing or send a response to the client
                res.send('File uploaded successfully.');
            }
        });

    } catch (error) {
      throw error
    }
  },
  fileDelete:async(payloadData,req,res)=>{
    try {
      const currentDir = __dirname;
      const newDir = path.resolve(currentDir, '..'); 
      const filePathToDelete = `${newDir}/public/images/360_F_363459597_I8q3zqhuKd9HyfWm3XWmP4SSD2RFfMIo.jpg` // Replace with your file path

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
  },
  // readExcel:async(payloadData,req,res)=>{
  //   try {
  //     console.log("req.files",req.files)
  //     var tmp_path = req.files.thumbnail.path;
  //     console.log("req.files.thumbnail",req.files.thumbnail)
  //     var target_path = './public/images/' + req.files.thumbnail.name;

  //     let status=await commonHelper.fileUpload(tmp_path,target_path)
  //       const filePath = path.join(__dirname, '..', 'public','images', req.files.thumbnail.name);
  //       const file = reader.readFile(filePath) 
  //       let data = [] 
  //       const sheets = file.SheetNames 
  //       for(let i = 0; i < sheets.length; i++) 
  //       { 
  //          const temp = reader.utils.sheet_to_json( 
  //               file.Sheets[file.SheetNames[i]]) 
  //          temp.forEach((res) => { 
  //             data.push(res) 
  //          }) 
  //       } 
  //       // const cleanedData = data.map(entry => {
  //       //   const nameEmailData = {};
  //       //   const nameEmailMatch = entry.__EMPTY.match(/Name: (.+) Email: (.+)/);
        
  //       //   if (nameEmailMatch) {
  //       //     nameEmailData.Name = nameEmailMatch[1];
  //       //     nameEmailData.Email = nameEmailMatch[2];
  //       //   }
        
  //       //   return nameEmailData;
  //       // });
  //       console.log("data",data)
  //       fs.unlinkSync(filePath);
   

  //   } catch (error) {
  //     throw error
  //   }
  // },

  
  readExcel:async(payloadData,req,res)=>{
    try {
      if (!req.files || !req.files.thumbnail) {
        return res.status(400).send('No file uploaded.');
      }
      const uploadedFile = req.files.image;

      if (!checkFileExtension(uploadedFile.name)) {
        // Invalid file extension
        return res.status(400).json({ error: 'Invalid file extension. Only .xlsx files are allowed.' });
      }
      const fileBuffer = req.files.thumbnail.data;
      const data = processExcelData(fileBuffer);
  
      console.log("data", data);
  
      // return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error.');
    }
  }
};