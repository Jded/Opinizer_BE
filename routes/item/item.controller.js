"use strict";
const Boom = require('boom');
const ItemDataService = require('./item.data.service.js');


module.exports = {
    getItemsForTemplate: function(request,reply){
        const service = new ItemDataService(request.pg.client);
        service.getAllForTemplate(request.params.item_template_id).then(function(result){
            reply(result);
        },function(err){
            reply(Boom.internal(err))
        })
    },
    getRecentItems: function(request,reply){
        const service = new ItemDataService(request.pg.client);
        service.getRecent(request.params.number).then(function(result){
            reply(result);
        },function(err){
            reply(Boom.internal(err))
        })
    },
    getItem: function(request,reply){
        const service = new ItemDataService(request.pg.client);
        if(request.params.item_instance_id){
            service.get(request.params.item_instance_id).then(function(result){
                reply(result);
            },function(err){
                reply(Boom.notFound("Item does not exist"));
            });
        }
    },
    saveItem: function(request,reply){
        const service = new ItemDataService(request.pg.client);
        let user = request.auth.credentials;
        let item = request.payload;
        item.user_id = parseInt(user.user_id);
        service.store(item).then(function(result){
            reply(result);
        },function(error){
            reply(Boom.badData("Error when storing: "+error))
        })
    },
    updateItem: function(request,reply){
        const service = new ItemDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin_privilege;
        let newItem = request.payload;
        if(parseInt(request.params.item_instance_id) !== parseInt(newItem.item_instance_id)){
            reply(Boom.badData("Id mismatch"));
        }
        if(parseInt(newItem.user_id) != parseInt(user.user_id) && !isAdmin){
            reply(Boom.unauthorized("Only owner can update"));
        }
        service.update(newItem,isAdmin).then(function(result){
            reply(result)
        },function(error){
            if(error === "not found"){
                reply(Boom.notFound("No item for updating"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }

        });

    },
    deleteItem: function(request,reply){
        const service = new ItemDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin_privilege;
        service.delete(request.params.item_instance_id,isAdmin,user.user_id).then(function(result){
            reply(result);
        },function(error){
            if(error === 'not found'){
                reply(Boom.notFound("Item does not exist"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }
        })
    }
}