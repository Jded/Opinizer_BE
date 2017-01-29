"use strict";
module.exports = class CommentDataService{

    constructor(client){
        this.client = client;
    }

    store(comment){
        return new Promise((resolve,reject)=>{
            this.client.query(
                'INSERT into opinizer.comment_simple (user_id, item_id, comment_text, creation_date, grade) VALUES($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING comment_id',
                [comment.user_id, comment.item_id, comment.comment_text, comment.grade] , (err, result) => {
                    if (err) reject(err);
                    const id = result.rows[0].comment_id;
                    this.addFields(comment.addValues,id, resolve,reject);
                });
        });
    }

    update(comment, adminOverride){
        return new Promise((resolve,reject)=>{
            const success = (err, result) => {
                if (err) {reject(err);}
                else if(result.rowCount !== 1){
                    reject("not found")
                } else{
                    resolve(result.rowCount);
                }
            }
            if(adminOverride){
                this.client.query(
                    'UPDATE opinizer.comment_simple SET comment_text = $1, grade = $2 WHERE comment_id = $3',
                    [comment.comment_text, comment.grade, comment.comment_id] , success);
            }else{
                this.client.query(
                    'UPDATE opinizer.comment_simple SET comment_text = $1, grade = $2 WHERE comment_id = $3 AND user_id = $4',
                    [comment.comment_text, comment.grade, comment.comment_id, comment.user_id] , success);
            }

        });

    }


    delete(commentId, adminOverride, userId){
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
                    'DELETE FROM opinizer.comment_simple WHERE commentId = $1',
                    [commentId] , success);
            }else{
                this.client.query(
                    'DELETE FROM opinizer.comment_simple WHERE commentId = $1 AND user_id = $2',
                    [commentId, userId] , success);
            }

        });
    }

    getAllForItem(itemId){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT 
                *
                FROM opinizer.comment_simple 
                WHERE comment_simple.item_id = ${itemId}`, (err, result) => {
                console.log(result)
                if (err) reject(err);
                resolve(result.rows);
            });
        });
    }

    getAllForUser(userId){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT 
                *
                FROM opinizer.comment_simple 
                WHERE comment_simple.user_id = ${userId}`, (err, result) => {
                console.log(result)
                if (err) reject(err);
                resolve(result.rows);
            });
        });
    }

    getRecent(number){
        return new Promise((resolve,reject)=>{
            this.client.query(`SELECT 
                *
                FROM opinizer.comment_simple 
                GROUP BY item_instance.item_instance_id
                LIMIT ${number} ORDER BY item_instance.creation_date DESC`, (err, result) => {
                console.log(result)
                if (err) reject(err);
                resolve(result.rows);
            });
        });
    }
}