/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const message = sequelize.define('message', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		senderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'senderId',
			defaultValue: 0,
		},
        receiverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'receiverId',
			defaultValue: 0,
		},
		productId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'productId',
			defaultValue: 0,
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
        senderType: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'senderType',
			defaultValue: 0,
		},
        receiverType: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'receiverType',
			defaultValue: 0,
		},
        message: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'message',
			defaultValue: 0,
		},
		thumbnail: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'thumbnail',
			defaultValue: null,
		},
        deletedId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'deletedId',
			defaultValue: 0,
		},
        chatConstantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'chatConstantId',
			defaultValue: 0,
		},
        readStatus: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'readStatus',
			defaultValue: 0,
		},
        messageType: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'messageType',
			defaultValue: 0,
		},
		created: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created'
		},
		updated: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
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
		}
	}, {
		tableName: 'message',
	});
	message.associate = models => {
		message.belongsTo(models.user, { foreignKey: 'senderId', as: 'sender', hooks: false });
		message.belongsTo(models.user, { foreignKey: 'receiverId', as: 'receiver', hooks: false });
		// message.hasOne(models.chatConstants, { foreignKey: 'chatConstantId', as: 'lastMessageIds' });
		message.belongsTo(models.product,{foreignKey:'productId',as:"product"})
        message.belongsTo(models.group,{foreignKey:"groupId",as:"group"})
	};
	return message;
};
