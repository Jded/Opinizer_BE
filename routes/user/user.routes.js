"use strict";
const controller = require('./user.controller.js');
const Joi = require("joi");
module.exports = [
    {
        path :'/user',
        method:'POST',
        config:{
            validate: {
                payload: {
                    login:Joi.string().max(64).required(),
                    first_name: Joi.string().max(64).allow(''),
                    last_name: Joi.string().max(64).allow(''),
                    email: Joi.string().email().required(),
                    password: Joi.string().min(2).max(64).required()
                }
            },
            auth: { mode: "try" },
            handler: controller.registerUser
        }
    },
    {
        path :'/user/{user_id}',
        method:'PUT',
        config:{
            validate: {
                payload: {
                    login:Joi.string().max(64).required(),
                    first_name: Joi.string().max(64),
                    last_name: Joi.string().max(64),
                    email: Joi.string().email().required()
                }
            },
            handler: controller.updateUser
        }
    },
    {
        path :'/user',
        method:'GET',
        config:{
            handler: controller.getUsers
        }
    },
    {
        path :'/user/{user_id}',
        method:'GET',
        config:{
            handler: controller.getUser
        }
    },
    {
        path :'/user/{user_id}',
        method:'DELETE',
        config:{
            handler: controller.deleteUser
        }
    },
    {
        path :'/user/{user_id}/elevate',
        method:'GET',
        config:{
            handler: controller.elevateUserPermissions
        }
    },
    {
        path :'/user/{user_id}/reduce',
        method:'GET',
        config:{
            handler: controller.reduceUserPermissions
        }
    },
    {
        path :'/user/{user_id}/activate',
        method:'GET',
        config:{
            handler: controller.activateUser
        }
    },
    {
        path :'/user/{user_id}/deactivate',
        method:'GET',
        config:{
            handler: controller.deactivateUser
        }
    },
    {
        path :'/user/{user_id}/change-password',
        method:'PUT',
        config:{
            validate: {
                payload: {
                    oldPassword: Joi.string().max(64).required(),
                    newPassword: Joi.string().max(64).required()
                }
            },
            handler: controller.changePassword
        }
    },
    {
        path :'/user/validate-login/{login}',
        method:'GET',
        config:{
            auth: { mode: "try" },
            handler: controller.validateLogin
        }
    }
]