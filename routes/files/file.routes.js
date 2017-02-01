'use strict';
const controller = require('./file.controller.js');

module.exports = [
    {
        method: 'POST',
        path: '/file',
        config: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: true
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
        path :'/file/my',
        method:'GET',
        config:{
            handler: controller.getMyFiles
        }
    },
    {
        path :'/file',
        method:'GET',
        config:{
            handler: controller.getAllFiles
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