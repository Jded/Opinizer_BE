"use strict";
const Boom = require('boom');
const UserDataService = require('./user.data.service.js');


module.exports = {
    getUsers: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let loggedUser = request.auth.credentials;
        let isAdmin = loggedUser.admin_privilege;
        if(isAdmin){
            service.getAll().then(function(result){
                reply(result);
            },function(err){
                reply(Boom.internal(err))
            })
        }else{
            reply(Boom.unauthorized("Admin privilege required to view users"))
        }

    },
    getUser: function(request,reply){
        const service = new UserDataService(request.pg.client);
        if(request.params.item_template_id){
            service.get(request.params.item_template_id).then(function(result){
                reply(result);
            },function(err){
                reply(Boom.notFound("Item template does not exist"));
            });
        }

    },
    registerUser: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let user = request.payload;
        service.store(user).then(function(result){
            reply(result);
        },function(error){
            reply(Boom.badData("Error when storing: "+error))
        })
    },
    updateUser: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin;
        let userData = request.payload;
        if(parseInt(userData.user_id) != parseInt(user.user_id) && !isAdmin){
            reply(Boom.unauthorized("Only admin can update another user"));
        }
        service.update(userData,isAdmin).then(function(result){
            return reply(result);
        },function(error){
            if(error === "not found"){
                reply(Boom.notFound("No item for updating"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }

        });

    },
    deleteUser: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin;
        service.delete(request.params.item_template_id,isAdmin,user.user_id).then(function(result){
            reply(result);
        },function(error){
            if(error === 'not found'){
                reply(Boom.notFound("Item template does not exist"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }
        })
    },
    elevateUserPermissions: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin;
        if(!isAdmin){
            reply(Boom.unauthorized("Only admin can update another user"));
        }
        service.elevatePermissions(request.params.user_id).then(function(result){
            reply(true);
        },function(error){
            if(error === 'not found'){
                reply(Boom.notFound("Entity does not exist"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }
        })
    },
    reduceUserPermissions: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin;
        if(!isAdmin){
            reply(Boom.unauthorized("Only admin can update another user"));
        }
        service.reducePermissions(request.params.user_id).then(function(result){
            reply(true);
        },function(error){
            if(error === 'not found'){
                reply(Boom.notFound("Entity does not exist"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }
        })
    },
    activateUser: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin;
        if(!isAdmin){
            reply(Boom.unauthorized("Only admin can update another user"));
        }
        service.activate(request.params.user_id).then(function(result){
            reply(true);
        },function(error){
            if(error === 'not found'){
                reply(Boom.notFound("Entity does not exist"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }
        })
    },
    deactivateUser: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let user = request.auth.credentials;
        let isAdmin = user.admin;
        if(!isAdmin){
            reply(Boom.unauthorized("Only admin can update another user"));
        }
        service.deactivate(request.params.user_id).then(function(result){
            reply(true);
        },function(error){
            if(error === 'not found'){
                reply(Boom.notFound("Entity does not exist"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }
        })
    },
    changePassword: function(request,reply){
        const service = new UserDataService(request.pg.client);
        let user_id = request.params.user_id;
        let user = request.auth.credentials;
        let isAdmin = user.admin;
        if(parseInt(user_id) != parseInt(user.user_id) && !isAdmin){
            reply(Boom.unauthorized("Only admin can update another user"));
        }
        service.changePassword(user_id,request.payload.oldPassword, request.payload.newPassword).then(function(){
            reply(true);
        },function(error){
            if(error === 'not found'){
                reply(Boom.notFound("Entity does not exist"));
            }else{
                reply(Boom.badData("Error when updating: "+error));
            }
        })
    },
    validateLogin: function(request,reply){
        const service = new UserDataService(request.pg.client);
        service.validateLogin(request.params.login).then(function(result){
            if(result){
                reply()
            }else{
                reply(Boom.notFound("Not valid"));
            }
        })
    }
}