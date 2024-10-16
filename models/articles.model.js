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

const fetchArticles = () => {
    return db.query(`SELECT 
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            COUNT(comments.comment_id) AS comment_count 
            FROM articles
            LEFT JOIN comments
            ON articles.article_id = comments.article_id
            GROUP BY articles.article_id
            ORDER BY articles.created_at DESC;`)
        .then((result) => {
        return result.rows
        })
        .catch((err) => {
            next(err)
        })
}


module.exports = { fetchArticlesById, fetchArticles }