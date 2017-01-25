"use strict";
module.exports = class ItemTemplateDataService{

    constructor(client){
        this.client = client;
    }

    store(itemTemplate){
        return new Promise((resolve,reject)=>{
            this.client.query(
                'INSERT into opinizer.item_template (user_id, template_name, template_description, creation_date) VALUES($1, $2, $3, $4) RETURNING item_template_id',
                [itemTemplate.user_id, itemTemplate.template_name, itemTemplate.template_description, new Date()] , function (err, result) {
                if (err) reject(err);
                resolve(result.rows[0]);
            });
        });
    }

    update(itemTemplate, adminOverride){
        return new Promise((resolve,reject)=>{
            function success(err, result) {
                if (err) {reject(err);}
                else if(result.rowCount !== 1){
                    reject("not found")
                } else{
                    resolve(result.rowCount);
                }
            }
            if(adminOverride){
                this.client.query(
                    'UPDATE opinizer.item_template SET template_name = $1, template_description = $2 WHERE item_template_id = $3',
                    [itemTemplate.template_name, itemTemplate.template_description, itemTemplate.item_template_id] , success);
            }else{
                this.client.query(
                    'UPDATE opinizer.item_template SET template_name = $1, template_description = $2 WHERE item_template_id = $3 AND user_id = $4',
                    [itemTemplate.template_name, itemTemplate.template_description, itemTemplate.item_template_id, itemTemplate.user_id] , success);
            }

        });

    }

    get(itemTemplateId){
        return new Promise((resolve,reject)=>{
            this.client.query("SELECT * FROM opinizer.item_template WHERE item_template_id = '" +itemTemplateId + "'", function (err, result) {
                if (err) reject(err);
                if(result.rows.length !== 1){
                    reject('not found');
                }else{
                    resolve(result.rows[0]);
                }
            });
        });
    }

    delete(itemTemplateId, adminOverride, userId){
        return new Promise((resolve,reject)=>{
            function success(err, result) {
                if (err) {reject(err);}
                else if(result.rowCount !== 1){
                    reject("not found")
                } else{
                    resolve(result.rowCount);
                }
            }
            if(adminOverride){
                this.client.query(
                    'DELETE FROM opinizer.item_template WHERE item_template_id = $1',
                    [itemTemplateId] , success);
            }else{
                this.client.query(
                    'DELETE FROM opinizer.item_template WHERE item_template_id = $1 AND user_id = $2',
                    [itemTemplateId, userId] , success);
            }

        });
    }

    getAll(){
        return new Promise((resolve,reject)=>{
            this.client.query('SELECT * FROM opinizer.item_template', function (err, result) {
                if (err) reject(err);
                resolve(result.rows);
            });
        });
    }

}