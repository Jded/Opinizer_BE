"use strict";
module.exports = class ItemTemplateDataService{

    constructor(client){
        this.client = client;
    }

    store(itemTemplate){
        return new Promise((resolve,reject)=>{
            this.client.query(
                'INSERT into opinizer.item_template (user_id, template_name, template_description, creation_date, file_id) VALUES($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING item_template_id',
                [itemTemplate.user_id, itemTemplate.template_name, itemTemplate.template_description, itemTemplate.file_id] , (err, result) => {
                if (err) reject(err);
                const id = result.rows[0].item_template_id;
                this.addFields(itemTemplate.addFields,id, resolve,reject);
            });
        });
    }


    addFields(fields,id,resolve,reject){
        let prepared = {
            name:"insert-template-fields",
            text:"INSERT INTO opinizer.item_field (field_type,creation_date,field_name,item_template_id) VALUES ($1,CURRENT_TIMESTAMP,$2,$3)"
        }
        let numberDone = 0;
        for(let field of fields){
            this.client.query(prepared,[field.field_type, field.field_name, id],(err,result)=>{
                if(err)reject(err);
                numberDone++;
                if(numberDone == fields.length){
                    resolve({item_template_id:id});
                }
            })
        }
    }

    removeFields(fields,id,resolve,reject){
        let prepared = {
            name:"remove-template-fields",
            text:"DELETE FROM opinizer.item_field WHERE item_field_id = $1 AND item_template_id = $2"
        }
        let numberDone = 0;
        for(let field of fields){
            this.client.query(prepared,[field.item_field_id, id],(err,result)=>{
                if(err)reject(err);
                numberDone++;
                if(numberDone == fields.length){
                    resolve(id);
                }
            })
        }
    }

    update(itemTemplate, adminOverride){
        return new Promise((resolve,reject)=>{
            const success = (err, result) => {
                if (err) {reject(err);}
                else if(result.rowCount !== 1){
                    reject("not found")
                } else{
                    this.removeFields(itemTemplate.removeFields, itemTemplate.item_template_id,reject,()=>{});
                    this.addFields(itemTemplate.addFields, itemTemplate.item_template_id,reject, ()=>{});
                    resolve(result.rowCount);
                }
            }
            if(adminOverride){
                this.client.query(
                    'UPDATE opinizer.item_template SET template_name = $1, template_description = $2, file_id = $3 WHERE item_template_id = $4',
                    [itemTemplate.template_name, itemTemplate.template_description, itemTemplate.file_id, itemTemplate.item_template_id] , success);
            }else{
                this.client.query(
                    'UPDATE opinizer.item_template SET template_name = $1, template_description = $2, file_id = $3 WHERE item_template_id = $4 AND user_id = $5',
                    [itemTemplate.template_name, itemTemplate.template_description, itemTemplate.file_id, itemTemplate.item_template_id, itemTemplate.user_id] , success);
            }

        });

    }

    processReadFields(row){
        const properFields = ["item_template_id","user_id","template_name","template_description", "creation_date", "file_id"];
        let fields = [];
        let field_map = {};

        for(let i in row.field_ids){
            if(row.field_ids[i] !== null && !field_map[row.field_ids[i]]){
                field_map[row.field_ids[i]] = true;
                fields.push({
                    item_field_id:row.field_ids[i],
                    field_type:row.field_types[i],
                    field_name:row.field_names[i],
                    creation_date:row.creation_dates[i],
                    item_template_id:row.item_template_id
                })
            }
        }
        let files = [];
        let file_map = {};
        for(let i in row.file_id){
            if(row.file_id[i] !== null && !file_map[row.file_id[i]]){
                file_map[row.file_id[i]] = true;
                files.push({
                    file_id:row.file_id[i],
                    filename:row.filenames[i],
                    address:row.addresses[i],
                    creation_date:row.file_dates[i]
                })
            }
        }

        return properFields.reduce((target, key) => { target[key] = row[key]; return target; }, {fields:fields, files:files});
    }
    
    get(itemTemplateId){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT
                item_template.item_template_id, item_template.file_id, item_template.user_id, item_template.template_name, item_template.template_description, item_template.creation_date, 
                array_agg(item_field.item_field_id) AS field_ids,array_agg(item_field.field_type) AS field_types,array_agg(item_field.field_name) AS field_names,array_agg(item_field.creation_date) AS creation_dates, 
                array_agg(file.filename) as filenames, array_agg(file.address) as addresses, array_agg(file.creation_date) as file_dates 
                FROM opinizer.item_template AS item_template 
                LEFT JOIN opinizer.item_field AS item_field ON item_field.item_template_id = item_template.item_template_id 
                LEFT JOIN opinizer.file AS file ON file.file_id = ANY(item_template.file_id) 
                WHERE item_template.item_template_id = '${itemTemplateId}' 
                GROUP BY item_template.item_template_id`, (err, result) => {
                console.log(err)
                if (err) reject(err);
                if(result.rows.length !== 1){
                    reject('not found');
                }else{
                    resolve(this.processReadFields(result.rows[0]));
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
            this.client.query(`SELECT 
                item_template.item_template_id, item_template.file_id, item_template.user_id, item_template.template_name, item_template.template_description, item_template.creation_date, 
                array_agg(item_field.item_field_id) AS field_ids,array_agg(item_field.field_type) AS field_types,array_agg(item_field.field_name) AS field_names,array_agg(item_field.creation_date) AS creation_dates, 
                array_agg(file.filename) as filenames, array_agg(file.address) as addresses, array_agg(file.creation_date) as file_dates 
                FROM opinizer.item_template AS item_template 
                LEFT JOIN opinizer.item_field AS item_field ON item_field.item_template_id = item_template.item_template_id
                LEFT JOIN opinizer.file AS file ON file.file_id = ANY(item_template.file_id)
                GROUP BY item_template.item_template_id`, (err, result) => {
                if (err) reject(err);

                resolve(result.rows.map((row)=>this.processReadFields(row)));
            });
        });
    }
    getRecent(number){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT 
                item_template.item_template_id, item_template.file_id, item_template.user_id, item_template.template_name, item_template.template_description, item_template.creation_date, 
                array_agg(item_field.item_field_id) AS field_ids,array_agg(item_field.field_type) AS field_types,array_agg(item_field.field_name) AS field_names,array_agg(item_field.creation_date) AS creation_dates, 
                array_agg(file.filename) as filenames, array_agg(file.address) as addresses, array_agg(file.creation_date) as file_dates 
                FROM opinizer.item_template AS item_template 
                LEFT JOIN opinizer.item_field AS item_field ON item_field.item_template_id = item_template.item_template_id
                LEFT JOIN opinizer.file AS file ON file.file_id = ANY(item_template.file_id)
                GROUP BY item_template.item_template_id
                ORDER BY item_template.creation_date DESC LIMIT ${number}
                `, (err, result) => {
                console.log(err)
                if (err) reject(err);

                resolve(result.rows.map((row)=>this.processReadFields(row)));
            });
        });
    }
    getUserTemplates(user_id){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT 
                item_template.item_template_id, item_template.file_id, item_template.user_id, item_template.template_name, item_template.template_description, item_template.creation_date, 
                array_agg(item_field.item_field_id) AS field_ids,array_agg(item_field.field_type) AS field_types,array_agg(item_field.field_name) AS field_names,array_agg(item_field.creation_date) AS creation_dates, 
                array_agg(file.filename) as filenames, array_agg(file.address) as addresses, array_agg(file.creation_date) as file_dates 
                FROM opinizer.item_template AS item_template 
                LEFT JOIN opinizer.item_field AS item_field ON item_field.item_template_id = item_template.item_template_id
                LEFT JOIN opinizer.file AS file ON file.file_id = ANY(item_template.file_id)
                WHERE item_template.user_id = '${user_id}' 
                GROUP BY item_template.item_template_id
                `, (err, result) => {
                console.log(err)
                if (err) reject(err);

                resolve(result.rows.map((row)=>this.processReadFields(row)));
            });
        });
    }

}