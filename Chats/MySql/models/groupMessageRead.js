/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const groupMessageRead = sequelize.define('groupMessageRead', {
		id:{
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		groupId:{
            type: DataTypes.INTEGER,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            references: {
                key: "id",
                model: "group"
            },
		},
        messageId:{
            type: DataTypes.INTEGER,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            references: {
                key: "id",
                model: "message"
            },
        },
        userId:{
            type: DataTypes.INTEGER,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            references: {
                key: "id",
                model: "users"
            },
        },
        is_Read:{
           type:DataTypes.INTEGER(11),
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
	}, {
		tableName: 'groupMessageRead'
	});
    groupMessageRead.associate = models => {
		groupMessageRead.belongsTo(models.user, { foreignKey: 'userId', as: 'users' });
		groupMessageRead.belongsTo(models.group, { foreignKey: 'groupId', as: 'group' });
	
	};

	return groupMessageRead;
};
