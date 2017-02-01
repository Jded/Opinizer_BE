"use strict";
const Boom = require('boom');
const ItemTemplateDataService = require('./item-template.data.service.js');


module.exports = {
    getTemplates: function(request,reply){
        const service = new ItemTemplateDataService(request.pg.client);
        service.getAll().then(function(result){
            reply(result);
        },function(err){
            reply(Boom.internal(err))
        })
    },
    getRecentTemplates: function(request,reply){
        const service = new ItemTemplateDataService(request.pg.client);
        service.getRecent(request.params.number).then(function(result){
            reply(result);
        },function(err){
            reply(Boom.internal(err))
        })
    },
    getMyTemplates: function(request,reply){
        const service = new ItemTemplateDataService(request.pg.client);
        let user = request.auth.credentials;
        service.getUserTemplates(user.user_id).then(function(result){
            reply(result);
        },function(err){
            reply(Boom.internal(err))
        })
    },
    getTemplate: function(request,reply){
        const service = new ItemTemplateDataService(request.pg.client);
        if(request.params.item_template_id){
            service.get(request.params.item_template_id).then(function(result){
                reply(result);
            },function(err){
                reply(Boom.notFound("Item template does not exist"));
            });
        }

    },
    saveTemplate: function(request,reply){
        const service = new ItemTemplateDataService(request.pg.client);
        let user = request.auth.credentials;
        let template = request.payload;
        template.user_id = parseInt(user.user_id);
        service.store(template).then(function(result){
            reply(result);
        },function(error){
            reply(Boom.badData("Error when storing: "+error))
        })
    },
    updateTemplate: function(request,reply){
        const service = new ItemTemplateDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin_privilege;
        let newTemplate = request.payload;
        if(parseInt(request.params.item_template_id) !== parseInt(newTemplate.item_template_id)){
            reply(Boom.badData("Id mismatch"));
        }
        if(parseInt(newTemplate.user_id) != parseInt(user.user_id) && !isAdmin){
            reply(Boom.unauthorized("Only owner can update"));
        }
        service.update(newTemplate,isAdmin).then(function(result){
            reply(result)
        },function(error){
            if(error === "not found"){
                reply(Boom.notFound("No item for updating"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }

        });

    },
    deleteTemplate: function(request,reply){
        const service = new ItemTemplateDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin_privilege;
        service.delete(request.params.item_template_id,isAdmin,user.user_id).then(function(result){
            reply(result);
        },function(error){
            if(error === 'not found'){
                reply(Boom.notFound("Item template does not exist"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }
        })
    }
}