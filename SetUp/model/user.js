let appConstants = require("../config/appConstants")
module.exports = function (Sequelize, sequelize, DataTypes) {
	return sequelize.define("profile", {
		...require("./core")(Sequelize, DataTypes),
		email: {
			type: DataTypes.STRING(200),
			allowNull: true
		},
		emailVerified: {
			type: DataTypes.TINYINT(1),
			defaultValue: 0,
			field: "emailVerified"
		},
		password: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: "password"
		},
		passwordResetToken: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: "passwordResetToken"
		},
		forgotPasswordGeneratedAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW(0),
			field: "forgotPasswordGeneratedAt"
		},
		Image: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		Name: {
			type: DataTypes.STRING(150),
			defaultValue: null,
		},
		Pronouns: {
			type: DataTypes.ENUM,
			values: appConstants.APP_CONSTANTS.PRONOUNS_NAME
		},
		Bio: {
			type: DataTypes.STRING(300),
			defaultValue: null,
		},
		phoneNumber: {
			type: DataTypes.STRING(16),
			defaultValue: null,
		},
		dateOfBirth: {
			type: DataTypes.DATE,
            field: "dateOfBirth"
		},
		Gender: {
			type: DataTypes.ENUM,
            values: appConstants.APP_CONSTANTS.GENDER
		},
		currentLocation: {
			type: DataTypes.STRING(30),
			defaultValue: null
		},
		location: {
			type: DataTypes.STRING(30),
			defaultValue: null 
		},
		zipCode: {
			type: DataTypes.INTEGER(10),
			defaultValue: null
		},
		document: {
			type: DataTypes.STRING(255),
			defaultValue: null
		},
		marriageCertificate: {
			type: DataTypes.STRING(255),
			defaultValue: null
		},
		termCondition: {
			type: DataTypes.TINYINT(1),
			defaultValue: 0,
			field: "termCondition",
		},
		deviceIdentifier: {
			allowNull: true,
			type: DataTypes.STRING(200)
		},
		deviceToken: {
			allowNull: true,
			type: DataTypes.STRING(255)
		},
		accessToken: {
			allowNull: true,
			type: DataTypes.TEXT
		},
		deviceType: {
			allowNull: true,
			type: DataTypes.STRING(200)
		}	

	}, {
		tableName: "profile",
		timestamps: true,
		paranoid: true,
		deletedAt: 'destroyTime'
	});
};