/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const socketUser = sequelize.define('socketUser', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'userId',
			defaultValue: 0,
		},
        socketId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'socketId',
			defaultValue: 0,
		},
        isOnline: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'isOnline',
			defaultValue: 0,  //0 for offline and 1 for online
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
		tableName: 'socketUser',
	});

	socketUser.associate = models => {
		socketUser.belongsTo(models.user, { foreignKey: 'userId' });
	};

	return socketUser;
};
