/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const group = sequelize.define('group', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
        shareId:{
            type: DataTypes.INTEGER,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
			allowNull: false,
            references: {
                key: "id",
                model: "product"
            },
        },
		groupName: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
        adminId:{
            type: DataTypes.INTEGER,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
			allowNull: false,
            references: {
                key: "id",
                model: "user"
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
		tableName: 'group'
	});
    group.associate = models => {
		group.belongsTo(models.user, { foreignKey: 'adminId' });	
        group.hasMany(models.groupChatUser,{foreignKey:"groupId",as:"groupUser"})
		group.belongsTo(models.product,{foreignKey:"shareId"})
	};

	return group;
};
