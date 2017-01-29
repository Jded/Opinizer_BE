"use strict";
const crypto = require('crypto');
const uploadPath =  __dirname + "../../../uploads/img/";
const fs = require('fs');

function checkFileExists(filepath){
    let flag = true;
    try{
        fs.accessSync(filepath, fs.F_OK);
    }catch(e){
        flag = false;
    }
    return flag;
}

module.exports = {
    saveFile: function(fileStream){
        return new Promise((resolve,reject)=> {
            let original_name = fileStream.hapi.filename;
            let suffix = "." + original_name.split(".").pop();
            let fileCode = require('crypto').createHash('md5').update(original_name + String(new Date().getTime())).digest("hex");
            let path = uploadPath + fileCode + suffix;
            while (checkFileExists(path)) {
                fileCode = require('crypto').createHash('md5').update(fileCode + String(new Date().getTime())).digest("hex");
                path = uploadPath + fileCode + suffix;
            }
            let file = fs.createWriteStream(path);
            file.on('error', function (err) {
                reject(err);
            });

            fileStream.pipe(file);
            fileStream.on('end', function (err) {
                if(err){
                    reject(err);
                }else{
                    resolve(
                        {
                            filename: original_name,
                            address: fileCode + suffix
                        }
                    )
                }
            })
        })
    },
    deleteFile: function(fileName){
        return new Promise((resolve,reject)=> {
            fs.unlink(uploadPath + fileName, function (err) {
                if(err){
                    reject(err);
                }else{
                    resolve(true);
                }
            })
        })
    }
}

