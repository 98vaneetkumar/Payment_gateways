var express = require('express');
var router = express.Router();
/* GET home page. */
router.get("/", (req, res) => {
	res.render("index", { title: "Express" });
});
router.get("/documents", (req, res) => {
	let jsonData = require("./../config/documentation/swagger.json");
	console.log("jsonD.host",jsonData.host)
	delete jsonData.host;
	jsonData.host = `${req.hostname}:3001`;
	console.log("jsonData.host:  ", jsonData.host);
	return res.status(200).send(jsonData);
});
module.exports = router;
