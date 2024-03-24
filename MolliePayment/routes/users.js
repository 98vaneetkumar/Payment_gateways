var express = require('express');
var router = express.Router();
const controller=require("../controller/MolliePayment")
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/paymentIntent",controller.payment)
router.get('/paymentSuccess',controller.paymentSuccess)

module.exports = router;
