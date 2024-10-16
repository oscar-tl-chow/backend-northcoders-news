const { fetchArticlesById , fetchArticles } = require("../models/articles.model")

const getArticlesById = (request, response, next) => {
    fetchArticlesById(request.params.article_id)

    .then((article) => {
        response.status(200).send({ article })
    })
    .catch((err) => {
    next(err)
    })
}

const getArticles = (request, response, next) => {
    fetchArticles()
    .then((articles) => {
        response.status(200).send({ articles })
    })
    .catch((err) => {
        next(err)
    })
}

module.exports = { getArticlesById , getArticles }