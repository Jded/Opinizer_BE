"use strict";

const controller = require('./comment.controller.js');
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
        path :'/comment/item/{item_instance_id}',
        method:'GET',
        config:{
            handler: controller.getItemsComments,
            auth: { mode: 'try' },
        }
    },
    {
        path :'/comment/user/{user_id}',
        method:'GET',
        config:{
            handler: controller.getUsersComments,
            auth: { mode: 'try' },
        }
    },
    {
        path :'/comment/recent/{number}',
        method:'GET',
        config:{
            auth: { mode: 'try' },
            handler: controller.getRecentComments
        }
    },
    {
        path :'/comment',
        method:'POST',
        config:{
            validate: {
                payload: {
                    item_id: Joi.string().min(2).max(128).required(),
                    addValues:Joi.string(),
                    grade:Joi.number()
                }
            },
            handler: controller.saveComment
        }
    },
    {
        path :'/comment/{comment_id}',
        method:'PUT',
        config: {
            validate: {
                payload: {
                    item_id: Joi.string().required(),
                    addValues:Joi.string(),
                    grade:Joi.number(),
                    comment_id:Joi.string().required()
                }
            },
            handler: controller.updateComment
        }
    },
    {
        path :'/comment/{comment_id}',
        method:'DELETE',
        config:{
            handler: controller.deleteComment
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