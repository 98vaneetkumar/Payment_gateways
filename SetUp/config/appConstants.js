const SERVER_CONST = {
	MOBILE_REGEX_NEW_SPACE: "^[0-9]*$",
	FIRST_NAME_REGEX: /^([a-zA-Z0-9 _@$%./#&''"+-,]+)$/,
	EMAIL_REGEX: /^\w+([-]?\w+)*@\w+([-]?\w+)*(\w{2,3})+$/
};
const APP_CONSTANTS = {
	ACHIEVEMENT_EVENT_TYPES: ["COUNT", "SUM", "AVERAGE"],
	ACHIEVEMENT_EVENTS: ["Referral", "Like", "Comment", "Report"],
	ACHIEVEMENT_TYPES: ["Parallel", "Sequential"],
	ADMIN_MODULES: ["adminManagement", "dashboard", "notificationManagement", "systemConfiguration", "userManagement", "reportManagement"],
	ADMIN_TYPES: ["ADMIN", "NON_ADMIN"],
	EDU_QUALFIC: ["BTECH","MTECH","MBA","MCA","BCA","BSC","BA",],
	PRONOUNS_NAME: ["He / Him","She / Her", "They / Them", "Add Custom"],
	GENDER: ["MALE","FEMALE","Non-binary"],
	SERVICE: ["MALE","FEMALE","OTHERS"],
	DEPARTMENT: ["ANDROID","IOS","WEB","HR","MARKETING","DEVOPS","",],
	adminTypes: {
		SUB_ADMIN: "ADMIN",
		SUPER_ADMIN: "ADMIN"
	},
	CHAT_TYPES: ["COMMENTS", "CHAT", "ONE_TO_ONE", "GROUP_CHAT"],
	FEEDBACK_TYPES: ["USER", "RIDER", "CATEGORY"],
	PLATFORM_TYPE: {
		android: "ANDROID",
		ios: "IOS",
		web: "WEB"
	},
	REACTION_TYPES: ["1", "2", "3", "4"],
	USER_ACTIVITIES: ["LOGIN", "SIGN_UP", "LOGOUT"],
	USER_VISITED: ["HOME", "PROFILE", "NOTIFICATION"],
	REPORT_ITEM_TYPES: ["COMMENT", "POST"],
	REPORT_STATUS: ["PENDING", "APPROVED", "DECLINED"],
	SUPPORTED_PLATFORMS: ["ANDROID", "IOS", "WEB"],
	TYPE_STATUS: ["PENDING", "ERROR", "DONE"],
	USER_SIGNUP_TYPES: ["EMAIL_OR_PHONE", "FACEBOOK", "GMAIL", "APPLE", "MICROSOFT"],
	userSignUpTypes: {
		APPLE: "APPLE",
		EMAIL_PASSWORD: "EMAIL_OR_PHONE",
		FACEBOOK: "FACEBOOK",
		GMAIL: "GMAIL",
		MICROSOFT: "MICROSOFT"
	},
	EMPLOYMENT_TYPE:["Full_time","Part_time","Contractual","Seasonal"],
	PROFICIENCY_TYPE:["Beginner","Proficient","Expert"]
};
module.exports = {
	APP_CONSTANTS: APP_CONSTANTS,
	SERVER_CONST: SERVER_CONST
};