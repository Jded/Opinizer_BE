"use strict";
const Boom = require('boom');
const CommentDataService = require('./comment.data.service.js');


module.exports = {
    getItemsComments: function(request,reply){
        const service = new CommentDataService(request.pg.client);
        service.getAllForItem(request.params.item_instance_id).then(function(result){
            reply(result);
        },function(err){
            reply(Boom.internal(err))
        })
    },
    getRecentComments: function(request,reply){
        const service = new CommentDataService(request.pg.client);
        service.getRecent(request.params.number).then(function(result){
            reply(result);
        },function(err){
            reply(Boom.internal(err))
        })
    },
    getUsersComments: function(request,reply){
        const service = new CommentDataService(request.pg.client);
        if(request.params.item_instance_id){
            service.getAllForUser(request.params.user_id).then(function(result){
                reply(result);
            },function(err){
                reply(Boom.notFound("Item does not exist"));
            });
        }
    },
    saveComment: function(request,reply){
        const service = new CommentDataService(request.pg.client);
        let user = request.auth.credentials;
        let comment = request.payload;
        comment.user_id = parseInt(user.user_id);
        service.store(comment).then(function(result){
            reply(result);
        },function(error){
            reply(Boom.badData("Error when storing: "+error))
        })
    },
    updateComment: function(request,reply){
        const service = new CommentDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin_privilege;
        let newComment = request.payload;
        if(parseInt(request.params.comment_id) !== parseInt(newComment.comment_id)){
            reply(Boom.badData("Id mismatch"));
        }
        if(parseInt(newComment.user_id) != parseInt(user.user_id) && !isAdmin){
            reply(Boom.unauthorized("Only owner can update"));
        }
        service.update(newComment,isAdmin).then(function(result){
            reply(result)
        },function(error){
            if(error === "not found"){
                reply(Boom.notFound("No item for updating"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }

        });

    },
    deleteComment: function(request,reply){
        const service = new CommentDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin_privilege;
        service.delete(request.params.comment_id,isAdmin,user.user_id).then(function(result){
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