module.exports=(Sequelize,sequelize,DataTypes)=>{
    return sequelize.define("users",{
        ...require("./core")(Sequelize,DataTypes),
        name:{
            type:DataTypes.STRING(255),
            allowNull:true
        },
        email:{
            type:DataTypes.STRING(255),
            allowNull:true
        },
        password:{
            type:DataTypes.STRING(255),
            allowNull:true,
            defaultValue:null 
        },
        deviceToken:{
            type:DataTypes.STRING(255),
            allowNull:true,
            defaultValue:null
        },
        platformType:{
            type:DataTypes.ENUM,
            values:["ANDROID", "IOS", "WEB", "ALL"]
        }
    },{
        tableName: "users"
    })
}