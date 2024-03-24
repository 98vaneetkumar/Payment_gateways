const messages = {
	success: {
		ADDED: "ADDED SUCCESSFULLY",
		UPDATED: "UPDATED SUCCESSFULLY",
		DELETED: "DELETED SUCCESSFULLY",
		BLOCKED: "BLOCKED SUCCESSFULLY",
		UNBLOCKED: "UNBLOCKED SUCCESSFULLY",
		REGISTER: "Verification OTP has been sent to your email, Please verify your account.",
		FORGOT: "Please check your email address for verification code. Please enter the verification code to reset your password.",
		FORGOT_INVALID: "NO account registered with this email, Please try new one.",
		RESET_PASSWORD: "Password updated successfully, Please login now.",
		LOGIN: "You have successfully logged In.",
		LOGOUT: "You have successfully logged Out.",
	},
	error: {
		DUPLICATE_EMAIL: "Account already exist with this email.",
		INVALID_EMAIL: "No Account registered with this email, Please try other one.",
		REGISTER: "Some Error occurred, while adding user.",
		FORGOT: "Some Error Occurred, While recovering password.",
		RESET_PASSWORD: "Some Error Occurred, While updating your new password.",
		LOGIN_PASSWORD: "Invalid Password",
		LOGIN_INVALID: "Invalid Username or Password",
		LOGOUT: "Some Error Occurred, While logging Out.",
		SERVER: "Some Error Occurred, Please try after Some time.",
	}
};
module.exports = messages;