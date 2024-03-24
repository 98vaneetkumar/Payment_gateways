var express = require('express');
var router = express.Router();
const sendResponse = require("../helper/sendResponse");
const indexController=require("../controller/index")
const authorization=require("../middleWares/authentication").verifyToken
//User for upload Image and video in folder;
const upload=require("../helper/uploadMulter");
const awsUpload=require("../helper/s3Upload");
//apn -- Apple push notification its full form
const fileUpload=require("../helper/apn");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
router.post("/register",(req, res) => {
	let payload = req.body
	return sendResponse.executeMethod(indexController.userController.registerUser, payload, req, res);
});


router.post("/login",(req, res) => {
	let payload = req.body
	return sendResponse.executeMethod(indexController.userController.login, payload, req, res);
});


router.put("/update",authorization,(req, res) => {
	let payload = req.body
	return sendResponse.executeMethod(indexController.userController.updateUser, payload, req, res);
});

router.put("/getAllUser",authorization,(req, res) => {
	let payload = req.query || {};
	payload.userId = req.credentials.id;
	if ((payload.skip) && (payload.limit) && (payload.skip > 0)) {
		payload.skip = (payload.skip - 1) * payload.limit;
	}
	return sendResponse.executeMethod(indexController.userController.getAllUsers, payload, req, res);
});

router.get("/detail_Profile/:id",authorization, (req, res) => {
	return sendResponse.executeMethod(indexController.userController.getProfileById, req.params, req, res);
});


router.delete("/deleteAccount",authorization, (req, res) => {
  let payload = req.query || {};
	payload.userId = req.credentials.id;
	return sendResponse.executeMethod(indexController.userController.deleteUserAccount, payload, req, res);
});
router.get("/test", (req, res) => {
	return sendResponse.executeMethod(indexController.userController.test, req.body, req, res);
});

router.post("/upload",multipartMiddleware, (req, res) => {
	return sendResponse.executeMethod(indexController.userController.fileUpload, req.body, req, res);
});

router.post("/uploadFileDelete",(req,res)=>{
	return sendResponse.executeMethod(indexController.userController.fileDelete,req.body,req,res)
})

router.post("/readExcel",(req,res)=>{
	return sendResponse.executeMethod(indexController.userController.readExcel,req.body,req,res)
})


module.exports = router;
