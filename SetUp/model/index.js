var Sequelize = require("sequelize");
var sequelize = require("../dbconnection").sequelize;
module.exports = {
  User: require("./user")(Sequelize, sequelize, Sequelize.DataTypes),
};