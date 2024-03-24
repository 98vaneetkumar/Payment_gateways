/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const chatConstants = sequelize.define('chatConstants', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		senderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		receiverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		groupId:{
			type: DataTypes.INTEGER,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
			allowNull:true,
            references: {
                key: "id",
                model: "group"
            },
		},
        productId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'productId',
			defaultValue: 0,
		},
		lastMessageId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:null
		},
		typing: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:0
		},
		deletedId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:0

		},
		deletedLastMessageId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:0
		},
		is_in_listing:{
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:0
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		unreadCount:{
			type:DataTypes.INTEGER,
			allowNull:true,
			defaultValue:0
		},
		onlineStatus:{
			type:DataTypes.BOOLEAN,
			allowNull:true,
			defaultValue:false
		}
	}, {
		tableName: 'chatConstants'
	});
    chatConstants.associate = models => {
		chatConstants.belongsTo(models.user, { foreignKey: 'senderId', as: 'sender' });
		chatConstants.belongsTo(models.user, { foreignKey: 'receiverId', as: 'receiver' });
		chatConstants.belongsTo(models.message,{foreignKey:"lastMessageId",as:"lastMessageIds"})	
		chatConstants.belongsTo(models.product, { foreignKey: 'productId', as: 'product' });
		chatConstants.belongsTo(models.group, { foreignKey: 'groupId', as: 'group' });

	};

	return chatConstants;
};
