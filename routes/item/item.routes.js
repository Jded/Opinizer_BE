"use strict";

const controller = require('./item-template.controller.js');
const Joi = require("joi");

const fieldValue = Joi.object().keys({
    field_type: Joi.number().required(),
    item_field_id: Joi.string(),
    item_id: Joi.string(),
    item_field_value_id: Joi.string(),
    value: Joi.any(),
});

module.exports = [
    {
        path :'/item/{item_instance_id}',
        method:'GET',
        config:{
            handler: controller.getItem,
            auth: { mode: 'try' },
        }
    },
    {
        path :'/item/template/{item_template_id}',
        method:'GET',
        config:{
            auth: { mode: 'try' },
            handler: controller.getItemsForTemplate
        }
    },
    {
        path :'/item/recent/{number}',
        method:'GET',
        config:{
            auth: { mode: 'try' },
            handler: controller.getRecentItems
        }
    },
    {
        path :'/item',
        method:'POST',
        config:{
            validate: {
                payload: {
                    item_name: Joi.string().min(2).max(128).required(),
                    addValues:Joi.array().items(fieldValue),
                    file_id:Joi.array().items(Joi.string())
                }
            },
            auth: { mode: 'try' },
            handler: controller.saveItem
        }
    },
    {
        path :'/item/{item_instance_id}',
        method:'PUT',
        config: {
            validate: {
                payload: {
                    item_name: Joi.string().min(2).max(128).required(),
                    user_id: Joi.number().integer().required(),
                    item_template_id: Joi.number().integer().required(),
                    item_instance_id: Joi.number().integer().required(),
                    creation_date: Joi.string(),
                    addValues:Joi.array().items(fieldValue),
                    removeValues:Joi.array().items(fieldValue),
                    updateValues:Joi.array().items(fieldValue),
                    file_id:Joi.array().items(Joi.string())
                }
            },
            handler: controller.updateItem
        }
    },
    {
        path :'/item/{item_instance_id}',
        method:'DELETE',
        config:{
            handler: controller.deleteItem
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