var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const fileUpload = require("express-fileupload");
const swaggerUi = require('swagger-ui-express');
const fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload());
var swaggerOptions = {
	explorer: true,
	swaggerOptions: {
		urls: [
			{
				url: "/documents",
				name: "API",
			},
		],
	},
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);



//Database call here 
require("./dbconnection").connectDB();

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
let PORT=8000
app.listen(PORT,()=>{
  console.log(`http://localhost:${PORT}`)
})
module.exports = app;





// sendFeed: async (req, res) => {
//   try {
//     const formData = JSON.parse(req.body.data);
//     console.log("formData", formData);

//     // Extract the necessary values from formData
//     const title = formData.find(item => item.name === "title")?.value || "";
//     const email = formData.find(item => item.name === "email")?.value || "";
//     const solution = formData.find(item => item.name === "solution")?.value || "";
//     console.log("email----",email)
//     var transporter = nodemailer.createTransport({
//       host: "smtp.mailtrap.io",
//       port: 2525,
//       auth: {
//         user: "28182524df1f82",
//         pass: "6a2bf03dbde623",
//       },
//     });

//     const mailOptions={
//       from: '"👻" mailto:malkeet@example.com',
//       to: email,
//       subject: title,
//       text: solution,
//     }
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//        console.log("Error---------->",error);
//       }
//       console.log('Message sent: %s', info.messageId);
//     })
//     // send mail with defined transport object
//     // let info = await transporter.sendMail({
//     //   from: '"👻" mailto:malkeet@example.com',
//     //   to: email,
//     //   subject: title,
//     //   text: solution,
//     // });
// // console.log("Info sen=====>>",info)
//     // Update the feedback record in the database
//     const dataReturn = await db.feedback.update(
//       {
//         isReplied: 1,
//         solution: solution,
//         title: title,
//       },
//       { where: { email: email, isReplied: 0 } }
//     );

//     console.log("dataReturn=>>>", dataReturn);
//     res.redirect("/admin/feedList");
//     // return true
//   } catch (error) {
//     console.log(error);
//   }
// },