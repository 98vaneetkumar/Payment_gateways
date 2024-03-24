
var error_msg = {
	invalidToken: {
		message: "Your are unauthorized. Please login or create account to get access.",
		statusCode: 401,
		responseType: ""
	},
	invalidPromoCode: {
		message: "Your Promo Code is invalid.",
		statusCode: 401,
		responseType: ""
	},
	alreadyPromoCode: {
		message: "Your Promo Code is already exist.",
		statusCode: 401,
		responseType: ""
	},
	alreadyExistTemplateAction: {
		message: "Your Template Action is already exist.",
		statusCode: 401,
		responseType: ""
	},
	expiredPromoCode: {
		message: "Your Promo Code has been expired.",
		statusCode: 401,
		responseType: ""
	},
	startedPromoCode: {
		message: "Not yet started Promo code.",
		statusCode: 401,
		responseType: ""
	},
	invalidForgotToken: {
		message: "Invalid forgot password token.",
		statusCode: 401,
		responseType: ""
	},
	otpExpired: {
		statusCode: 401,
		message: "OTP expired, please generate another one.",
		responseType: "OTP_EXPIRED"
	},
	invalidAccess: {
		message: "Service not Included in your Plan. Please Upgrade Your Plan for this Service.",
		statusCode: 401,
		responseType: ""
	},
	blockUser: {
		message: "Your account has been blocked. Please contact admin.",
		statusCode: 401,
		responseType: ""
	},
	blockJob: {
		message: "Job has been blocked.",
		statusCode: 401,
		responseType: ""
	},
	deletedJob: {
		message: "Job has been deleted.",
		statusCode: 401,
		responseType: ""
	},
	InvalidID: {
		message: "Your id is invalid.",
		statusCode: 400,
		responseType: ""
	},
	EMPTY_VALUE: {
		statusCode: 400,
		message: "Empty String Not Allowed",
		responseType: ""
	},
	deleteUser: {
		message: "Your account has been deleted. Please contact admin",
		statusCode: 401,
		responseType: ""
	},
	alreadyExist: {
		message: "This email address is  already registered with us.",
		statusCode: 400,
		responseType: ""
	},
	ALREADY_EXISTS_FACCBOOK: {
		statusCode: 400,
		message: "Your account is already registered via Facebook. Please continue with Facebook.",
		type: "ALREADY_EXISTS_FACCBOOK"
	},
	ALREADY_EXISTS_GMAIL: {
		statusCode: 400,
		message: "Your account is already registered via Google Plus. Please continue with Google Plus.",
		responseType: "ALREADY_EXISTS_GMAIL"
	},
	ALREADY_EXISTS_APPLE: {
		statusCode: 400,
		message: "Your account is already registered via Apple. Please continue with Apple.",
		responseType: "ALREADY_EXISTS_APPLE"
	},
	ALREADY_EXISTS_WECHAT: {
		statusCode: 400,
		message: "Your account is already registered via Wechat. Please continue with Wechat.",
		responseType: "ALREADY_EXISTS_WECHAT"
	},
	adminWithNumberExist: {
		message: "This phone number is already linked with another account, Please another phone number.",
		statusCode: 400,
		responseType: ""
	},
	numberAlreadyExist: {
		message: "This number is already registered with us.",
		statusCode: 400,
		responseType: ""
	},
	emailNotFound: {
		statusCode: 400,
		message: "This email is invalid.",
		responseType: ""
	},
	phoneNotFound: {
		statusCode: 400,
		message: "This phone number is invalid.",
		responseType: ""
	},
	emailNotVerified:{
		statusCode: 400,
		message: "Please verify your email before trying to access your account.",
		responseType: ""
	},
	emailOrPhoneNumberRequired: {
		statusCode: 400,
		message: "Please enter email or phone number",
		responseType: ""
	},
	emailAndPasswordNotFound: {
		statusCode: 400,
		message: "This email or password is invalid.",
		responseType: ""
	},
	pendingStatusNotFound: {
		statusCode: 400,
		message: "Your account has not been approved. Please contact admin",
		responseType: ""
	},
	rejectedStatusNotFound: {
		statusCode: 400,
		message: "Your account has been rejected. Please contact admin.",
		responseType: ""
	},
	emailAndPhoneNotFound: {
		statusCode: 400,
		message: "The email or phone number entered is invalid/wrong",
		responseType: ""
	},
	passwordNotMatch: {
		statusCode: 400,
		message: "Please enter valid password",
		responseType: ""
	},
	currentPasswordNotMatched: {
		statusCode: 400,
		message: "Your current password is wrong",
		responseType: ""
	},
	oldPasswordNotMatch: {
		statusCode: 400,
		message: "Old password is not valid.",
		responseType: ""
	},
	matchOldPassword: {
		statusCode: 400,
		message: "You have entered old password",
		responseType: ""
	},
	deletedAccount: {
		statusCode: 400,
		message: "Your account is deleted.",
		responseType: ""
	},
	invalidLink: {
		statusCode: 400,
		message: "Invalid Link.",
		responseType: ""
	},
	emailAlreadyVerified: {
		statusCode: 400,
		message: "Email already verified.",
		responseType: ""
	},
	implementationError: {
		statusCode: 400,
		message: "Implementation Error.",
		responseType: "IMPLEMENTATION_ERROR"
	},
	invalidOtp: {
		statusCode: 400,
		message: "Otp entered is invalid/wrong",
		responseType: "INVALID_OTP"
	},
	emailExists: {
		statusCode: 400,
		message: "Email already exists.",
		responseType: "EMAIL_EXISTS"
	},
	JOB_APPLYED: {
		statusCode: 400,
		message: "Job already apply.",
		responseType: "JOB_APPLYED"
	},
	JOB_SAVED: {
		statusCode: 400,
		message: "Job already saved.",
		responseType: "JOB_SAVED"
	},
	ALREADY_EXISTS_SUGGESTED_SKILL: {
		statusCode: 400,
		message: "Suggested Skill already exists.",
		responseType: "SUGGESTED_SKILL_EXISTS"
	},
	RCHILLI_DATA_ERROR: {
		statusCode: 400,
		message: "Resume Data not Parsing",
		responseType: "RCHILLI_DATA_ERROR"
	}
};
var STATUS_MSG = {
	SUCCESS: {
		FOLLOWED: {
			statusCode: 200,
			customMessage: "Followed Successfully",
			type: "FOLLOWED"
		},
		UNFOLLOWED: {
			statusCode: 200,
			customMessage: "Unfollowed Successfully",
			type: "UNFOLLOWED"
		},
		CREATED: {
			customMessage: "Created Successfully",
			statusCode: 200,
			type: "CREATED"
		},
		CONTESTJOINED: {
			customMessage: "Challenge joined successfully",
			statusCode: 200,
			type: "CONTESTJOINED"
		},
		CONTESTCANCELED: {
			customMessage: "Challenge canceled successfully",
			statusCode: 200,
			type: "CONTESTCANCELED"
		},
		CONTESTALREADY: {
			customMessage: "You've already joined this challenge.",
			statusCode: 200,
			type: "ALREADY_EXISTS"
		},
		DEFAULT: {
			customMessage: "Success",
			statusCode: 200,
			type: "DEFAULT"
		}
	}
};

var sendSuccess = function (data) {
	let success_msg = {
		"statusCode": 200,
		"message": data.message || "Success",
		"data": data.data,
	};
	return success_msg;
};
module.exports = {
	error_msg: error_msg,
	sendSuccess: sendSuccess,
	STATUS_MSG: STATUS_MSG,
};