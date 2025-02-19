module.exports=(Sequelize,sequelize,DataTypes)=>{
    return sequelize.define("comments",{
        ...require("./core")(Sequelize,DataTypes),
        comment:{
            type:DataTypes.STRING(255),
            AllowNull:true
        },
        postId:{
            onDelete:"CASCADE",
            onUpdate:"CASCADE",
            references:{
                key:"id",
                model:"posts"
            },
            defaultValue:null,
            type:Sequelize.UUID
        },
        userId:{
            onDelete:"CASCADE",
            onUpdate:"CASCADE",
            references:{
                key:"id",
                model:"users"
            },
            defaultValue:null,
            type:Sequelize.UUID
        },
       commentId:{
            onDelete:"CASCADE",
            onUpdate:"CASCADE",
            references:{
                key:"id",
                model:"comments"
            },
            defaultValue:null,
            type:Sequelize.UUID
       }
    })
}