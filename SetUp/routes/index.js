// If we use swagger UI then call her this is use for swagger calling
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/documents", (req, res) => {
	let jsonData = require("./../config/documentation/swagger.json");
	delete jsonData.host;
	jsonData.host = `${req.hostname}:8000`;
	console.log("jsonData.host:  ", jsonData.host);
	return res.status(200).send(jsonData);
});

module.exports = router;
