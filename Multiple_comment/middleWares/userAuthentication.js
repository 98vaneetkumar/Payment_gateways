const Jwt = require("jsonwebtoken");
const Services = require("../service");
const response = require("../config/response");
const Models = require("../models");
const PRIVATE_KEY="#$2dte53267*$&%#fhf"

const verifyToken = async(req, res, next) => {
	if (req.headers && req.headers.authorization) {
		var token = req.headers.authorization;
		token = token.replace("Bearer ", "");
		let tokenData = await Jwt.verify(token, PRIVATE_KEY);
			let criteria = {
				"id": tokenData.id,
				"isDeleted": "0",
			};
			let projection = ["id", "email", "isBlocked"];
			let userData = await Services.userService.getUser(criteria, projection);
			if (userData) {
				if (userData && userData.isBlocked === 1) {
					return res.status(401).json({
						statusCode: 401,
						message: "Your account has been blocked by the Admin. Please contact support@support.com.",
					});
				} else {
					req.credentials = tokenData;
					req.credentials.accessToken = req.headers.authorization;
					await next();
				}
			} else {
				return res.status(401).json({
					statusCode: 401,
					message: "The token is not valid or User not Found!",
				});
			}
    }
};
module.exports = {
	verifyToken: verifyToken
};