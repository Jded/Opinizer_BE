"use strict";

const controller = require('./item-template.controller.js');
const Joi = require("joi");

const field = Joi.object().keys({
    field_name:Joi.string().required(),
    field_type:Joi.number().required(),
    item_field_id:Joi.string(),
    item_template_id:Joi.string(),
    creation_date:Joi.string()
});

module.exports = [
    {
        path :'/item-template',
        method:'GET',
        config:{
            handler: controller.getTemplates,
            auth: { mode: 'try' },
        }
    },
    {
        path :'/item-template/recent/{number}',
        method:'GET',
        config:{
            auth: { mode: 'try' },
            handler: controller.getRecentTemplates
        }
    },
    {
        path :'/item-template/my',
        method:'GET',
        config:{
            handler: controller.getMyTemplates
        }
    },

    {
        path :'/item-template/{item_template_id}',
        method:'GET',
        config:{
            auth: { mode: 'try' },
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
                    template_description: Joi.string().max(8192).allow(""),
                    addFields:Joi.array().items(field),
                    file_id:Joi.array().items(Joi.string())
                }
            },
            auth: { mode: 'try' },
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
                    creation_date: Joi.string(),
                    addFields:Joi.array().items(field),
                    removeFields:Joi.array().items(field),
                    file_id:Joi.array().items(Joi.string())
                }
            },
            handler: controller.updateTemplate
        }
    },
    {
        path :'/item-template/{item_template_id}',
        method:'DELETE',
        config:{
            handler: controller.deleteTemplate
        }
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