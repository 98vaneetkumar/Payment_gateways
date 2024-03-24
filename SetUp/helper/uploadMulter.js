const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.mimetype.startsWith("image/")){
        cb(null,"public/images/");
    }else if(file.mimetype.startsWith("video/")){
        cb(null,"public/videos")
    }else{
        cb(null, Error("Invalid file type"))
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const fileTypes= /jpeg|jpg|png|gif|mp4|avi|mov/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give a proper file format to upload.");
  },
});
;
module.exports = { upload };