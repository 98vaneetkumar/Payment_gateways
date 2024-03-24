const Response = require("../config/response");

exports.count = (model, criteria,order) => {
	return new Promise((resolve, reject) => {
		let where = criteria;
		where.isDeleted = 0;
		model
			.count({
				where: where,
				order:order
			}).then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.getSingleRecord = (model, criteria, projection) => {
	return new Promise((resolve, reject) => {
		model
			.findOne({
				where: criteria,
				attributes: projection,
			}).then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.getAllRecords = (model, criteria, projection) => {
	return new Promise((resolve, reject) => {
		model
			.findAndCountAll({
				where: criteria,
				attributes: projection,
			}).then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.getAllRecordsWithLimitSkip = (model, criteria, projection, limit, offset) => {
	let order = [
		[
			"createdAt", "DESC"
		]
	];
	if(criteria.sortBy && criteria.orderBy) {
		order = [
			[
				criteria.sortBy, criteria.orderBy
			]
		];
	}
	delete criteria.sortBy;
	delete criteria.orderBy;
	return new Promise((resolve, reject) => {
		model
			.findAndCountAll({
				limit,
				offset,
				where: criteria,
				attributes: projection,
				order: order
			}).then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.getAllRecordsWithoutCount = (model, criteria, projection) => {
	return new Promise((resolve, reject) => {
		model
			.findAll({
				where: criteria,
				attributes: projection,
			}).then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.getAllRecordsWithModels = (model, criteria, projection, includedModels) => {
	return new Promise((resolve, reject) => {
		model
			.findAll({
				where: criteria,
				attributes: projection,
				includedModels: includedModels.length ? includedModels : []
			}).then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.saveData = (model, objToSave) => {
	return new Promise((resolve, reject) => {
		model
			.create(objToSave)
			.then((result) => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.saveBulkData = (model, arrToSave) => {
	return new Promise((resolve, reject) => {
		model
			.bulkCreate(arrToSave)
			.then((result) => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};


exports.updateData = (model, criteria, objToSave) => {
	return new Promise((resolve, reject) => {
		model
			.update(objToSave, { where: criteria })
			.then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.delete = (model, criteria) => {
	return new Promise((resolve, reject) => {
		model
			.destroy({ where: criteria })
			.then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.getAllRecordsWithSequenceOrder = (model, criteria, projection, sortBy, orderBy) => {
	return new Promise((resolve, reject) => {
		model
			.findAndCountAll({
				where: criteria,
				attributes: projection,
				order: [["sequence", "ASC"], [sortBy, orderBy]]
			}).then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};

exports.getAllRecordsWithOrder = (model, criteria, projection, sortBy, orderBy) => {
	return new Promise((resolve, reject) => {
		model
			.findAll({
				where: criteria,
				attributes: projection,
				order: [[sortBy, orderBy]]
			}).then(result => {
				resolve(result);
			}).catch((err) => {
				console.log(err);
				reject(Response.error_msg.implementationError);
			});
	});
};