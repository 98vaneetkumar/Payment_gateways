/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const chatMessage = sequelize.define('chatMessage', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: true,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		deletedId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: 0,
			field: 'deletedId'
		},
		senderId: {
			type: DataTypes.BIGINT,
			allowNull: true,
			defaultValue: 0,
			field: 'senderId'
		},
		receiverId: {
			type: DataTypes.BIGINT,
			allowNull: true,
			defaultValue: 0,
			field: 'receiverId'
		},
		chatId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: 0,
			field: 'chatId'
		},
		lastMessageId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:null
		},
		isRead: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: 0,
			field: 'isRead'
			// comment: 0 => no, 1 => yes
		},
		messageType: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: 0,
			field: 'messageType',
			// comment: 0 => text, 1 => image
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: '',
			field: 'message',
		},
		created: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created'
		},
		updated: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'createdAt'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updatedAt'
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
		tableName: 'chatMessage',
	});

	chatMessage.associate = models => {
		chatMessage.belongsTo(models.user, { foreignKey: 'senderId', as: 'sender' });
		chatMessage.belongsTo(models.user, { foreignKey: 'receiverId', as: 'receiver' });
	};

	return chatMessage;
};
