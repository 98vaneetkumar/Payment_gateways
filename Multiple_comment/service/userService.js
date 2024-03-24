const Models=require("../models/index")
const baseService=require("./baseService")
const Response = require("../config/response");

exports.saveData = async (objToSave) => {
	return await baseService.saveData(Models.users, objToSave);
};
//save bulk
exports.saveBulkCreate = async (Models, objToSave) => {
	return await baseService.saveBulkData(Models, objToSave);
};
//test
exports.updateData = async (criteria, objToSave) => {
	return await baseService.updateData(Models.users, criteria, objToSave);
};
//delete data
exports.deleteData = async (ModelsSend, criteria, objToSave) => {
	return await baseService.updateData(ModelsSend, criteria, objToSave);
};
exports.getUser = (criteria, projection) => {
	return new Promise((resolve, reject) => {
		Models.users
			.findOne({
				where: criteria,
			})
			.then(result => {
				resolve(result);
			}).catch(err => {
				console.log("get err ==>>  ", err);
				reject(Response.error_msg.implementationError);
			});
	});
};