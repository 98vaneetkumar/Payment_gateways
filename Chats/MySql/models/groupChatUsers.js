/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const groupChatUser = sequelize.define('groupChatUser', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		groupId: {
            type: DataTypes.INTEGER,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            references: {
                key: "id",
                model: "group"
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
		tableName: 'groupChatUser'
	});
    groupChatUser.associate = models => {
		groupChatUser.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
		groupChatUser.belongsTo(models.group, { foreignKey: 'groupId', as: 'group' });
	
	};

	return groupChatUser;
};
