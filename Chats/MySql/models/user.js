/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const User = sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		role: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'role',
			defaultValue: 1,   //1 for admin 0 for user
		},
		customerId:{
			type: DataTypes.STRING(255),
			allowNull: true
		},
		stripeAccountId:{
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:''
		},
		hasAccountId:{
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: 0,
		},
		verified: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'verified',
			defaultValue: 0,
		},
		checked: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'checked',
			defaultValue: 0,
		},
		socialType: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'socialType',
			defaultValue: 0,
			comment: '1=>facebook, 2=>google 3=>apple'
		},
		deviceType: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'deviceType',
			defaultValue: 0,
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'status',
			defaultValue: 1,
		},
		deviceToken: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'deviceToken',
			defaultValue: '',
		},
		username: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'username',
			defaultValue: '',
		},
		firstName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
		},
		lastName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'email',
			defaultValue: '',
		},		
		countryCode: {
			type: DataTypes.STRING(5),
			allowNull: false,
			field: 'countryCode',
			defaultValue: '',
		},
		phone: {
			type: DataTypes.STRING(15),
			allowNull: false,
			field: 'phone',
			defaultValue: '',
		},
		countryCodePhone: {
			type: DataTypes.STRING(5),
			allowNull: false,
			field: 'countryCodePhone',
			defaultValue: '',
		},
		location: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'location',
			defaultValue: '',
		},
		latitude: {
			type: DataTypes.DECIMAL(10, 8),
			allowNull: false,
			field: 'latitude',
			defaultValue: 0,
		},
		longitude: {
			type: DataTypes.DECIMAL(11, 8),
			allowNull: false,
			field: 'longitude',
			defaultValue: 0,
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'image',
			defaultValue: '',
		},
		password: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'password',
			defaultValue: '',
		},
		otp:{
			type:DataTypes.INTEGER,
			allowNull:true,
			defaultValue:1
		},
		is_otp_verify:{
			type:DataTypes.INTEGER,
			allowNull:true,
			defaultValue:0
		},
		notificationStatus:{
			type:DataTypes.INTEGER,
			allowNull:true,
			defaultValue:1  // 1 mean on 0 means off
		},
		forgotPasswordHash: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'forgotPasswordHash',
			defaultValue: '',
		},
		socialId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			// field: 'socailId',
			defaultValue: '',
		},
		facebookId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'facebookId',
			defaultValue: '',
		},
		googleId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'googleId',
			defaultValue: '',
		},
		wallet: {
			type: DataTypes.DECIMAL(15, 2),
			allowNull: false,
			field: 'wallet',
			defaultValue: 0,
		},
		commissionType: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'commissionType',
			defaultValue: 0,
			comment: '0=>default, 1=>special',
		},
		specialCommission: {
			type: DataTypes.STRING(10),
			allowNull: false,
			field: 'specialCommission',
			defaultValue: '',
		},
		userInChatRoom:{
			type: DataTypes.INTEGER(100),
			allowNull: true,
			defaultValue: null,
		},
		chatType:{
			type: DataTypes.INTEGER(10),
			allowNull: true,
			defaultValue: 0,  // 1 for one to one 2 for group chat
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
		},
		deletedAt:{
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 'user',
		paranoid: true,
	});
	return User;
};
