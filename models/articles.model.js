const fs = require("fs/promises")
const db = require("../db/connection")
const { response } = require("../app")

const fetchArticlesById = (articleId) => {
    if(!Number(articleId)){
        return Promise.reject({ status: 400, msg: "bad request"})
    }
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
        const article = rows[0]
        if(!article){
            return Promise.reject({status: 404, msg: `no article found with ID ${articleId}`})
        }
        return article //return the article found
    }   
)}

module.exports = { fetchArticlesById }