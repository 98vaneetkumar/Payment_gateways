var express = require('express');
var router = express.Router();
const Controller=require("../controller/index")
const sendResponse=require("../config/sendResponse")
const authentication=require("../middleWares/userAuthentication").verifyToken;


router.post("/register", (req, res) => {
	return sendResponse.executeMethod(Controller.userController.registrationUser, req.body, req, res);
});

router.post("/login",(req,res)=>{
  return sendResponse.executeMethod(Controller.userController.login,req.body,req,res);
})

router.post("/addPosts",authentication,(req, res) => {
	let payload=req.body;
	payload.userId=req.credentials.id
	return sendResponse.executeMethod(Controller.userController.addposts, payload, req, res);
});

router.post("/addComment", authentication,(req, res) => {
	let payload=req.body;
	payload.userId=req.credentials.id
	return sendResponse.executeMethod(Controller.userController.addComment, payload, req, res);
});

router.get("/findOuterComments/:postId",authentication, (req, res) => {
  let payload = req.params;
	if ((payload.skip) && (payload.limit) && (payload.skip > 0)) {
		payload.skip = (payload.skip - 1) * payload.limit;
	}
	payload.userId=req.credentials.id
	return sendResponse.executeMethod(Controller.userController.findOuterComments, payload, req, res);
});

router.get("/findAllInnerComments/:commentId",authentication, (req, res) => {
  let payload = req.params;
	if ((payload.skip) && (payload.limit) && (payload.skip > 0)) {
		payload.skip = (payload.skip - 1) * payload.limit;
	}
	payload.userId=req.credentials.id

	return sendResponse.executeMethod(Controller.userController.findAllInnerComments, payload, req, res);
});

router.get("/findOneByOneInnerComments/:commentId",authentication, (req, res) => {
	let payload = req.params;
	  if ((payload.skip) && (payload.limit) && (payload.skip > 0)) {
		  payload.skip = (payload.skip - 1) * payload.limit;
	  }
	  payload.userId=req.credentials.id
	  return sendResponse.executeMethod(Controller.userController.findOneByOneInnerComments, payload, req, res);
  });

router.post("/multipleFileUpload",(req,res)=>{
	return sendResponse.executeMethod(Controller.userController.multipleFileUpload,req.body,req,res);
})  

router.delete("/deleteImage",(req,res)=>{
	return sendResponse.executeMethod(Controller.userController.fileDelete,req.body,req,res);
})  
module.exports = router;
