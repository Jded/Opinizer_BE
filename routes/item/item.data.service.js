"use strict";
module.exports = class ItemDataService{

    constructor(client){
        this.client = client;
    }

    store(itemInstance){
        return new Promise((resolve,reject)=>{
            this.client.query(
                'INSERT into opinizer.item_instance (user_id, item_name, item_template_id, creation_date, file_id) VALUES($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING item_instance_id',
                [itemInstance.user_id, itemInstance.item_name, itemInstance.item_template_id, itemInstance.file_id] , (err, result) => {
                    if (err) reject(err);
                    const id = result.rows[0].item_instance_id;
                    this.addFields(itemInstance.addValues,id, resolve,reject);
                });
        });
    }


    addValues(items,item_id,resolve,reject){
        let numberDone = 0;
        for(let item of items){
            let query;
            switch(item.field_type){
                case 1:
                    query = "INSERT INTO opinizer.item_field_value (item_field_id,item_id,value_text,field_type) VALUES ($1,$2,$3,$4)"
                    break;
                case 2:
                    query = "INSERT INTO opinizer.item_field_value (item_field_id,item_id,value_int,field_type) VALUES ($1,$2,$3,$4)"
                    break;
                case 3:
                    query = "INSERT INTO opinizer.item_field_value (item_field_id,item_id,value_dec,field_type) VALUES ($1,$2,$3,$4)"
                    break;
                case 4:
                    query = "INSERT INTO opinizer.item_field_value (item_field_id,item_id,value_date,field_type) VALUES ($1,$2,$3,$4)"
                    break;
            }
            this.client.query(query,[item.item_field_id, item_id, item.value, item.field_type],(err,result)=>{
                if(err)reject(err);
                numberDone++;
                if(numberDone == items.length){
                    resolve(item_id);
                }
            })
        }
    }

    removeValues(items,item_id,resolve,reject){
        let numberDone = 0;
        for(let item of items){
            let query = "DELETE from opinizer.item_field_value WHERE item_field_value_id = $1 AND item_id = $2"
            this.client.query(query,[item.item_field_value_id, item_id],(err,result)=>{
                if(err)reject(err);
                numberDone++;
                if(numberDone == items.length){
                    resolve(item_id);
                }
            })
        }
    }

    updateValues(item_values,item_id,resolve,reject){
        let numberDone = 0;
        for(let item_value of item_values){
            let query;
            switch(item_value.field_type){
                case 1:
                    query = `UPDATE opinizer.item_field_value SET value_text = $1 WHERE item_field_value_id = $2 AND item_id = $3`;
                    break;
                case 2:
                    query = `UPDATE opinizer.item_field_value SET value_int = $1 WHERE item_field_value_id = $2 AND item_id = $3`;
                    break;
                case 3:
                    query = `UPDATE opinizer.item_field_value SET value_dec = $1 WHERE item_field_value_id = $2 AND item_id = $3`;
                    break;
                case 4:
                    query = `UPDATE opinizer.item_field_value SET value_date = $1 WHERE item_field_value_id = $2 AND item_id = $3`;
                    break;
            }
            this.client.query(query,[item_value.value, item_value.item_field_value_id, item_id],(err,result)=>{
                if(err)reject(err);
                numberDone++;
                if(numberDone == item_values.length){
                    resolve(item_id);
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
                    this.updateValues(itemTemplate.updateValues, itemTemplate.item_instance_id,reject,()=>{});
                    this.removeValues(itemTemplate.removeValues, itemTemplate.item_instance_id,reject,()=>{});
                    this.addValues(itemTemplate.addValues, itemTemplate.item_instance_id,reject, resolve);
                    resolve(result.rowCount);
                }
            }
            if(adminOverride){
                this.client.query(
                    'UPDATE opinizer.item_instance SET item_name = $1, file_id = $2 WHERE item_instance_id = $3',
                    [itemTemplate.item_name, itemTemplate.file_id, itemTemplate.item_instance_id] , success);
            }else{
                this.client.query(
                    'UPDATE opinizer.item_instance SET item_name = $1, file_id = $2 WHERE item_template_id = $3 AND user_id = $4',
                    [itemTemplate.item_name, itemTemplate.file_id, itemTemplate.item_instance_id, itemTemplate.user_id] , success);
            }

        });

    }

    processReadFields(row){
        const properFields = ["item_template_id","item_instance_id","user_id","item_name","creation_date"];
        let fieldValues = [];
        for(let i in row.field_ids){
            if(row.field_ids[i] !== null){
                var value = {
                    item_field_id:row.field_ids[i],
                    field_type:row.field_types[i]
                }
                switch (row.field_types[i]){
                    case 1:
                        value.value =  row.v_t[i];
                        break;
                    case 2:
                        value.value =  row.v_i[i];
                        break;
                    case 3:
                        value.value =  row.v_d[i];
                        break;
                    case 4:
                        value.value =  row.v_dt[i];
                        break;
                }
                fieldValues.push(value)
            }
        }
        let files = [];
        for(let i in row.file_id){
            if(row.file_id[i] !== null){
                files.push({
                    file_id:row.file_id[i],
                    filename:row.filenames[i],
                    address:row.addresses[i],
                    creation_date:row.file_dates[i]
                })
            }
        }
        return properFields.reduce((target, key) => { target[key] = row[key]; return target; }, {values:fieldValues, files:files});
    }

    get(itemInstanceId){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT
                item_instance.item_template_id, item_instance.file_id, item_instance.user_id, item_instance.item_name, item_instance.creation_date, 
                array_agg(item_field_value.item_field_id) AS field_ids,array_agg(item_field_value.field_type) AS field_types, array_agg(item_field_value.value_text) AS v_t, array_agg(item_field_value.value_int) AS v_i, array_agg(item_field_value.value_dec) AS v_d, array_agg(item_field_value.value_date) AS v_dt, 
                array_agg(file.filename) as filenames, array_agg(file.address) as addresses, array_agg(file.creation_date) as file_dates 
                FROM opinizer.item_instance AS item_instance 
                LEFT JOIN opinizer.item_field_value AS item_field_value ON item_field_value.item_id = item_instance.item_instance_id 
                LEFT JOIN opinizer.file AS file ON file.file_id = ANY(item_instance.file_id) 
                WHERE item_instance.item_instance_id = '${itemInstanceId}' 
                GROUP BY item_instance.item_instance_id`, (err, result) => {
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
            }else{
                this.client.query(
                    'DELETE FROM opinizer.item_template WHERE item_template_id = $1 AND user_id = $2',
                    [itemTemplateId, userId] , success);
            }

        });
    }

    getAllForTemplate(itemTemplateId){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT 
                item_instance.item_template_id, item_instance.file_id, item_instance.user_id, item_instance.item_name, item_instance.creation_date, 
                array_agg(item_field_value.item_field_id) AS field_ids,array_agg(item_field_value.field_type) AS field_types, array_agg(item_field_value.value_text) AS v_t, array_agg(item_field_value.value_int) AS v_i, array_agg(item_field_value.value_dec) AS v_d, array_agg(item_field_value.value_date) AS v_dt, 
                array_agg(file.filename) as filenames, array_agg(file.address) as addresses, array_agg(file.creation_date) as file_dates 
                FROM opinizer.item_instance AS item_instance 
                LEFT JOIN opinizer.item_field_value AS item_field_value ON item_field_value.item_id = item_instance.item_instance_id 
                LEFT JOIN opinizer.file AS file ON file.file_id = ANY(item_instance.file_id) 
                WHERE item_instance.item_template_id = '${itemTemplateId}' 
                GROUP BY item_instance.item_instance_id`, (err, result) => {
                if (err) reject(err);

                resolve(result.rows.map((row)=>this.processReadFields(row)));
            });
        });
    }

    getRecent(number){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT 
                item_instance.item_template_id, item_instance.file_id, item_instance.user_id, item_instance.item_name, item_instance.creation_date, 
                array_agg(item_field_value.item_field_id) AS field_ids,array_agg(item_field_value.field_type) AS field_types, array_agg(item_field_value.value_text) AS v_t, array_agg(item_field_value.value_int) AS v_i, array_agg(item_field_value.value_dec) AS v_d, array_agg(item_field_value.value_date) AS v_dt, 
                array_agg(file.filename) as filenames, array_agg(file.address) as addresses, array_agg(file.creation_date) as file_dates 
                FROM opinizer.item_instance AS item_instance 
                LEFT JOIN opinizer.item_field_value AS item_field_value ON item_field_value.item_id = item_instance.item_instance_id 
                LEFT JOIN opinizer.file AS file ON file.file_id = ANY(item_instance.file_id) 
                GROUP BY item_instance.item_instance_id
                ORDER BY item_instance.creation_date DESC LIMIT ${number}
                `, (err, result) => {
                console.log(err)
                if (err) reject(err);

                resolve(result.rows.map((row)=>this.processReadFields(row)));
            });
        });
    }

}