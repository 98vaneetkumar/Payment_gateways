//file.mv function comes from a library like express-fileupload 

module.exports={
    fileUpload(file, folder = 'users') {
        let file_name_string = file.name;
        var file_name_array = file_name_string.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
        var result = "";
        while (result.length < 28) {
          var rand_int = Math.floor((Math.random() * 19) + 1);
          var rand_chr = letters[rand_int];
          if (result.substr(-1, 1) != rand_chr) result += rand_chr;
        }
        let name = result + '.' + file_extension;
        //file.mv function comes from a library like express-fileupload 
        file.mv('public/images/' + folder + '/' + name, function (err) {
          if (err) {
            throw err;
          }
        });
        return name;
      },
}