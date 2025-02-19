const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || 'development';
const config=require("./config/config.json")[env]
let sequelize;
if (config.use_env_variable) {
   sequelize = new Sequelize(process.env[config.use_env_variable], config);
 } else {
   sequelize = new Sequelize(config.database, config.username, config.password, {host:config.host,dialect:config.dialect});
 }

const connectDB=sequelize.authenticate().then(async() => {
    await sequelize.sync({alter:false}).then(() => {
        console.log('Connection has been established successfully.');
     }).catch((error) => {
        console.error('Unable to create table : ', error);
     });
 }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
 });

 module.exports={
    sequelize:sequelize,
    connectDB:connectDB
 }