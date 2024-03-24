const _ = require("underscore");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Models = require("../model");
const Response = require("../config/response");
const baseService = require("./base");


exports.saveData = async (objToSave) => {
	return await baseService.saveData(Models.User, objToSave);
};

exports.updateData = async (criteria, objToUpdate) => {
	return await baseService.updateData(Models.User, criteria, objToUpdate);
};
exports.delete = async (criteria) => {
	return await baseService.delete(Models.User, criteria);
};

exports.count = async (criteria) => {
	let where = {};
	if (criteria && (criteria.isBlocked !== undefined)) {
		where.isBlocked = criteria.isBlocked;
	}
	return await baseService.count(Models.Notification, where);
};

exports.getSessionDetail = (criteria, projection) => {
	if ("notInId" in criteria) {
		criteria.id != criteria.notInId;
		delete criteria.notInId;
	}
	return new Promise((resolve, reject) => {
		Models.User.findOne({ where: criteria, attributes: projection })
			.then(result => {
				resolve(result);
			}).catch(err => {
				console.log("aaaaaaaaaaa", err);
				reject(Response.error_msg.implementationError);
			});
	});
};


exports.getAllUser = (criteria, projection, limit, offset) => {
	let where = {};
	let order = [
		["createdAt","DESC"]
	]			

	if (criteria && criteria.search) {
		where = {
			[Op.or]: {
				Name: {
					[Op.like]: "%" + criteria.search + "%"
				},
				email: {
					[Op.like]: "%" + criteria.search + "%"
				},
				phoneNumber: {
					[Op.like]: "%" + criteria.search + "%"
				},
				dateOfBirth: {
					[Op.like]: "%" + criteria.search + "%"
				},
				Gender: {
					[Op.like]: "%" + criteria.search + "%"
				},
				currentLocation: {
					[Op.like]: "%" + criteria.search + "%"
				},
				id: {
					[Op.like]: "%" + criteria.search + "%"
				},
			}
		}
	}

	if (criteria.sortBy && criteria.orderBy) {
		order = [
			[criteria.sortBy, criteria.orderBy]
		]
	}
	where.isDeleted = 0;
	if (criteria["isBlocked"] === 1) where.isBlocked = 1;
	if (criteria["isDeleted"] === 1) where.isBlocked = 0;

	return new Promise((resolve, reject) => {
		Models.User
			.findAndCountAll({
				limit,
				offset,
				where: where,
				attributes: projection,
				order: order
			})
			.then(result => {
				resolve(result);
			}).catch(err => {
				console.log("getAll err ==>>  ", err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.getUser = (criteria, projection) => {
	return new Promise((resolve, reject) => {
		Models.User
			.findOne({
				where: criteria,
				attributes: projection,
			})
			.then(result => {
				resolve(result);
			}).catch(err => {
				console.log("get err ==>>  ", err);
				reject(Response.error_msg.implementationError);
			});
	});
};
