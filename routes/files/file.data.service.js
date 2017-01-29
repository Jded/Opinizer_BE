"use strict";
const crypto = require('crypto');

module.exports = class FileDataService{

    constructor(client){
        this.client = client;
    }

    store(fileData, user_id){
        return new Promise((resolve,reject)=>{
            this.client.query(
                'INSERT into opinizer.file (filename, address, creation_date, user_id) VALUES($1, $2, CURRENT_TIMESTAMP, $3) RETURNING *',
                [fileData.filename, fileData.address, user_id] , function (err, result) {
                    console.log('err',err)
                    if (err) reject(err);
                    resolve(result.rows[0]);
                });
        });
    }

    get(fileId){
        return new Promise((resolve,reject)=>{
            this.client.query("SELECT * FROM opinizer.file WHERE file_id = '" +fileId + "'", function (err, result) {
                if (err) reject(err);
                if(result.rows.length !== 1){
                    reject('not found');
                }else{
                    resolve(result.rows[0]);
                }
            });
        });
    }

    getMyFiles(userId){
        return new Promise((resolve,reject)=>{
            this.client.query("SELECT * FROM opinizer.file WHERE user_id = '" +userId + "'", function (err, result) {
                if (err) reject(err);
                resolve(result.rows);
            });
        });
    }

    getAllFiles(){
        return new Promise((resolve,reject)=>{
            this.client.query("SELECT * FROM opinizer.file", function (err, result) {
                if (err) reject(err);
                resolve(result.rows);
            });
        });
    }

    delete(fileId){
        return new Promise((resolve,reject)=>{
            function success(err, result) {
                if (err) {reject(err);}
                else if(result.rowCount !== 1){
                    reject("not found")
                } else{
                    resolve(result.rowCount);
                }
            }
            this.client.query(
                'DELETE FROM opinizer.file WHERE file_id = $1',
                [fileId] , success);
        });
    }

}