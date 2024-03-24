const Models=require("../models/index")
const baseService=require("./baseService")
const Response = require("../config/response");

Models.comment.belongsTo(Models.users,{
	foreignKey:"userId"
})

Models.comment.hasMany(Models.comment,{
	foreignKey:"commentId",
	as: "replies" // Use a different name for the association
})



exports.saveData = async (objToSave) => {
	return await baseService.saveData(Models.posts, objToSave);
};
exports.saveCommet = async (objToSave) => {
	return await baseService.saveData(Models.comment, objToSave);
};
//save bulk
exports.saveBulkCreate = async (Models, objToSave) => {
	return await baseService.saveBulkData(Models, objToSave);
};
//test
exports.updateData = async (criteria, objToSave) => {
	return await baseService.updateData(Models.posts, criteria, objToSave);
};
//delete data
exports.deleteData = async (ModelsSend, criteria, objToSave) => {
	return await baseService.updateData(ModelsSend, criteria, objToSave);
};
exports.findById = (criteria, projection) => {
	return new Promise((resolve, reject) => {
		Models.comment
			.findOne({
				where: criteria,
				include:[
					{
						model: Models.users,required:false,
						attributes:["id","name","email","createdAt","updatedAt"]
					},
			]
			})
			.then(result => {
				resolve(result);
			}).catch(err => {
				console.log("get err ==>>  ", err);
				reject(Response.error_msg.implementationError);
			});
	});
};

// Define a recursive function to fetch nested comments
async function getNestedComments(commentId) {
	const comments = await Models.comment.findAll({
	  where: { commentId: commentId ,},
	  raw: true, //raw: true option is used in the query, as raw: true returns plain JavaScript objects instead of Sequelize instances
	  include: [{ model: Models.users, attributes: ['id', 'name'],raw: true,  }], // Include user details
	});
	// Recursive call for nested comments
	const promises = comments.map(comment => getNestedComments(comment.id));
	const innerCommentsArray = await Promise.all(promises);
	for (let i = 0; i < comments.length; i++) {
	// comments[i].setDataValue('replies', innerCommentsArray[i]);// if not use of raw:true
	comments[i].replies = innerCommentsArray[i]; 
	}
	return comments;
  }

exports.findComment = (criteria, projection) => {
   return getNestedComments(criteria.commentId)
  };

  
