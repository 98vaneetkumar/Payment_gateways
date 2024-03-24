// //Apple push notification
// var apn = require("apn");
// module.exports={
//     async fileUpload(file, folder = "users") {
//         console.log(file, "===================================##@@");
    
//         let file_name_string = file.name;
//         var file_name_array = file_name_string.split(".");
    
//         var file_ext = file_name_array[file_name_array.length - 1];
    
//         var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
//         var result = "";
//         while (result.length < 28) {
//           var rand_int = Math.floor(Math.random() * 19 + 1);
//           var rand_chr = letters[rand_int];
//           if (result.substr(-1, 1) != rand_chr) result += rand_chr;
//         }
//         console.log("result====>",result)
//         var resultExt = `${result}.${file_ext}`;
//         await file.mv(
//           `public/images/${folder}/${result}.${file_ext}`,
//           function (err) {
//             if (err) {
//               throw err;
//             }
//           }
//         );
    
//         return resultExt;
//       },
//     uploadThumbAndVideo: async (file, folder = "users") => {
//         const videoName = file.name;
//         console.log("🚀 ~ videoName:", videoName);
//         const fileExt = videoName.split(".").pop(); // Extract file extension
    
//         // Generate a random name for the thumbnail
//         const letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
//         let thumbnailName = "";
//         while (thumbnailName.length < 28) {
//           const randIndex = Math.floor(Math.random() * letters.length);
//           thumbnailName += letters[randIndex];
//         }
//         const thumbnailExt = "jpg"; // Customize the thumbnail extension if needed
//         const thumbnailFullName = `${thumbnailName}.${thumbnailExt}`;
    
//         console.log("🚀 ~ thumbnailFullName:", thumbnailFullName);
    
//         // Move the video file to the specified folder
//         await file.mv(`public/images/${folder}/${videoName}`);
    
//         // Create a promise to handle the ffmpeg function
//         return new Promise((resolve, reject) => {
//           ffmpeg(`public/images/${folder}/${videoName}`)
//             .screenshots({
//               timestamps: ["05%"],
//               filename: thumbnailFullName,
//               folder: `public/images/${folder}`,
//               size: "320x240",
//             })
//             .on("end", (result) => {
//               console.log("🚀 ~ file: helper.js:141 ~ .on ~ result:", result);
//               resolve({ videoName, thumbnail: thumbnailFullName });
//               return { videoName, thumbnail: thumbnailFullName };
//             })
//             .on("error", (err) => {
//               reject(err);
//             });
//         });
//       },
// }