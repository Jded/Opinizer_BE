'use strict';
const controller = require('./file.controller.js');

module.exports = [
    {
        method: 'POST',
        path: '/file',
        config: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            },
            handler: controller.saveFile
        }
    },
    {
        path :'/file/{file_id}',
        method:'GET',
        config:{
            handler: controller.getFileInfo
        }
    },
    {
        path :'/file/{file_id}',
        method:'DELETE',
        config:{
            handler: controller.deleteFile
        }
    },
]