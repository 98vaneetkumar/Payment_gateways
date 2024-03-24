// const multer = require("multer");
// var aws = require("aws-sdk"),
//     multerS3 = require("multer-s3");
// aws.config.update({
//     accessKeyId: "", 
//     secretAccessKey: "",
//     Region: "us-east-2", // us-east-2
// });
// s3 = new aws.S3();
// const awsUpload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: "", // bucket name
//         key: function (req, file, cb) {
//             cb(null, "public/" + Date.now() + file.originalname); 
//         },
//     }),
// })
// module.exports= {awsUpload}