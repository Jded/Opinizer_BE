"use strict";
const controller = require('./session.controller.js');
const Joi = require("joi");
module.exports = [
    {
        path :'/session',
        method:'GET',
        config:{
            auth: { mode: 'try' },
            handler: controller.checkSession
        }
    },
    {
        path :'/session',
        method:'POST',
        config:{
            validate: {
                payload: {
                    email: Joi.string().min(2).max(64).required(),
                    password: Joi.string().min(2).max(64).required()
                }
            },
            auth: { mode: 'try' },
            handler: controller.login
        }
    },
    {
        path :'/session',
        method:'DELETE',
        handler: controller.logout
    }
]