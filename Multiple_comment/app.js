var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const fileUpload = require('express-fileupload');

var PORT=3001;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(fileUpload({
	useTempFiles: true,
	tempFileDir: '/tmp/'
  }));
app.use((req, res, next) => {
	//Enabling CORS
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
	);
	next();
});
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
app.use('/api/v1/user', usersRouter);
require("./dbConnection")
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT,(req,res)=>{
  console.log(`Server run on ${PORT}`)
})

module.exports = app;
