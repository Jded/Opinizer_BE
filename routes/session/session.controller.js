"use strict";
const Boom = require('boom');


function getValidatedUser(request){
    const UserDataService = require('./../user/user.data.service');
    return new UserDataService(request.pg.client).find(request.payload.email, request.payload.password);
}

module.exports = {
    checkSession: function(request,reply){
        let loggedUser = request.auth?request.auth.credentials:null;
        if(loggedUser){
            reply(loggedUser);
        }else{
            reply(Boom.unauthorized("No session"))
        }
    },
    login: function(request,reply){
        getValidatedUser(request)
            .then(function(user){
                if (user) {
                    let sid = require('crypto').createHash('md5').update(String(user.id)+ String(new Date().getTime())).digest("hex");
                    request.server.app.cache.set(sid, { account: user }, 0, (err) => {
                        if (err) {
                            reply(err);
                        }
                        request.cookieAuth.set({ sid: sid });
                        return reply(user);
                    });
                } else {
                    return reply(Boom.unauthorized("Bad email or password"));
                }
            })
            .catch(function(err){
                console.log(err)
                return reply(Boom.badImplementation());
            });
    },
    logout: function(request,reply){
        request.cookieAuth.clear();
        return reply({message:"Logut has worked"});
    }
}