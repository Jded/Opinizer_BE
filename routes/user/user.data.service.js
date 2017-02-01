"use strict";
const crypto = require('crypto');
module.exports = class UserDataService{

    constructor(client){
        this.client = client;
    }

    store(user){
        return new Promise((resolve,reject)=>{
            let hash1 = crypto.createHash('sha256').update(user.password).digest("hex");
            this.client.query(
                'INSERT into opinizer.user (login, email, first_name, last_name, registration_date, admin_privilege, password, confirmed) VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, crypt($6,gen_salt(\'md5\')), $7) RETURNING user_id',
                [user.login, user.email, user.first_name, user.last_name, false, user.password, false] , function (err, result) {
                    console.log('err',err)
                    if (err) reject(err);
                    resolve(result.rows[0]);
                });
        });
    }

    activate(user_id){
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
                'UPDATE opinizer.user SET confirmed = true WHERE user_id = $1',
                [user_id] , success);
        });
    }

    elevatePermissions(user_id){
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
                'UPDATE opinizer.user SET admin_privilege = true WHERE user_id = $1',
                [user_id] , success);
        });
    }

    deactivate(user_id){
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
                'UPDATE opinizer.user SET confirmed = false WHERE user_id = $1',
                [user_id] , success);
        });
    }

    reducePermissions(user_id){
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
                'UPDATE opinizer.user SET admin_privilege = false WHERE user_id = $1',
                [user_id] , success);
        });
    }

    update(user){
        return new Promise((resolve,reject)=>{
            function success(err, result) {
                if (err) {reject(err);}
                else if(result.rowCount !== 1){
                    reject("not found")
                } else{
                    resolve(result.rows[0]);
                }
            }
            this.client.query(
                `with upd as (UPDATE opinizer.user SET login = $1, email = $2, first_name = $3, last_name = $4, file_id = $5 WHERE user_id = $6 RETURNING *) 
        SELECT upd.user_id, upd.login, upd.first_name, upd.last_name, upd.email, upd.admin_privilege, upd.confirmed, upd.registration_date, upd.file_id, file.address, file.filename
        FROM upd LEFT JOIN opinizer.file as file ON upd.file_id = file.file_id`,
                [user.login, user.email, user.first_name, user.last_name, user.file_id, user.user_id] , success);
        });
    }

    changePassword(userId,oldPassword,newPassword){
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
                'UPDATE opinizer.user SET password = crypt($3,gen_salt(\'md5\')) WHERE user_id = $1 AND password = crypt($2, password)',
                [userId,oldPassword,newPassword] , success);
        });
    }

    get(userId){
        return new Promise((resolve,reject)=>{
            this.client.query("SELECT * FROM opinizer.user LEFT_JOIN opinizer.file as file ON user.file_id = file.file_id WHERE user_id = '" +userId + "'", function (err, result) {
                if (err) reject(err);
                if(result.rows.length !== 1){
                    reject('not found');
                }else{
                    resolve(result.rows[0]);
                }
            });
        });
    }

    find(emailOrLogin,password){
        let query = `with upd as (UPDATE opinizer.user SET last_login = CURRENT_TIMESTAMP WHERE (email = $1 OR login = $1) AND password = crypt($2, password) RETURNING *) 
        SELECT upd.user_id, upd.login, upd.first_name, upd.last_name, upd.email, upd.admin_privilege, upd.confirmed, upd.registration_date, upd.file_id, file.address, file.filename
        FROM upd LEFT JOIN opinizer.file as file ON upd.file_id = file.file_id`;
        //if(requireConfirmed){query = " AND confirmed = true";}
        return new Promise((resolve,reject)=>{
            this.client.query(query, [emailOrLogin,password],function (err, result) {
                console.log(err)
                if (err) reject(err);
                if(result.rows.length !== 1){
                    reject('not found');
                }else{
                    resolve(result.rows[0]);
                }
            });
        });
    }

    delete(userId){
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
                'DELETE FROM opinizer.user WHERE user_id = $1',
                [userId] , success);      
        });
    }

    getAll(){
        return new Promise((resolve,reject)=>{
            this.client.query('SELECT * FROM opinizer.user LEFT_JOIN opinizer.file as file ON user.file_id = file.file_id ', function (err, result) {
                if (err) reject(err);
                resolve(result.rows);
            });
        });
    }

    validateLogin(login){
        return new Promise((resolve,reject)=>{
            this.client.query('SELECT COUNT(*) FROM opinizer.user WHERE login = $1', [login], function (err, result) {
                if (err) reject(err);
                resolve(result.rows[0].count == 0);
            });
        });
    }

}