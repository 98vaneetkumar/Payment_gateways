const { Sequelize, DataTypes } = require("sequelize");
const sequelize=require("../dbConnection").sequelize;
module.exports={
    users:require("./users")(Sequelize,sequelize,DataTypes),
    posts:require("./post")(Sequelize,sequelize,DataTypes),
    comment:require("./comment")(Sequelize,sequelize,DataTypes)
}