"use strict";

const controller = require('./item-template.controller.js');
const Joi = require("joi");
module.exports = [
    {
        path :'/item-template',
        method:'GET',
        config:{
            handler: controller.getTemplates,
            auth: false
        }
    },
    {
        path :'/item-template/{item_template_id}',
        method:'GET',
        config:{
            auth: false,
            handler: controller.getTemplate
        }
    },
    {
        path :'/item-template',
        method:'POST',
        config:{
            validate: {
                payload: {
                    template_name: Joi.string().min(2).max(128).required(),
                    template_description: Joi.string().max(8192)
                }
            },
            handler: controller.saveTemplate
        }
    },
    {
        path :'/item-template/{item_template_id}',
        method:'PUT',
        config: {
            validate: {
                payload: {
                    template_name: Joi.string().min(2).max(128).required(),
                    template_description: Joi.string().max(8192),
                    user_id: Joi.number().integer().required(),
                    item_template_id: Joi.number().integer().required(),
                    creation_date: Joi.string()
                }
            },
            handler: controller.updateTemplate
        }
    },
    {
        path :'/item-template/{item_template_id}',
        method:'DELETE',
        handler: controller.deleteTemplate
    }/*,
    {
        path :'/item-template/search',
        method:'POST',
        config:{
            handler: controller.searchTemplates,
            auth: false
        }
    },*/
]