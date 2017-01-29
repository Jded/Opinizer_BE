'use strict';
const Boom = require('boom');
const fileService = require("./file.disk.service.js");
const FileDataService = require("./file.data.service.js");

module.exports = {
    saveFile: function (request, reply) {
        let data = request.payload;
        if (data.file) {
            let user = request.auth.credentials;
            fileService.saveFile(data.file).then(function(fileData){
                let dataService = new FileDataService(request.pg.client);
                dataService.store(fileData, parseInt(user.user_id)).then(function(fullFileData){
                    reply(fullFileData);
                },function(error){
                    reply(Boom.badData(error));
                })
            },function(error){
                reply(Boom.badData(error));
            })
        }else{
            reply(Boom.badData("Form missing correct file input"))
        }
    },
    deleteFile:function(request,reply){
        let dataService = new FileDataService(request.pg.client);
        let user = request.auth.credentials;
        dataService.get(request.params.file_id).then(function(result){
            if(!user.admin_privilege && parseInt(result.user_id)!= parseInt(user.user_id)){
                reply(Boom.unauthorized("Cannot delete somebody else's files"))
            }else{
                fileService.deleteFile(result.address).then(function(result){
                    dataService.delete(request.params.file_id).then(function(res){
                        reply("File deleted")
                    },function(err){
                        reply(Boom.internal("Cannot delete file info"));
                    })
                },function(err){
                    reply(Boom.internal("Cannot delete file"));
                })
            }
        },function(err){
            reply(Boom.notFound("File does not exist"));
        })

    },
    getFileInfo:function(request,reply){
        let dataService = new FileDataService(request.pg.client);
        dataService.get(request.params.file_id).then(function(result){
            reply(result);
        },function(err){
            reply(Boom.notFound("File does not exist"));
        })
    }

}