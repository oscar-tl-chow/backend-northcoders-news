const { fetchArticlesById , fetchArticles , fetchArticleComments } = require("../models/articles.model")

const getArticles = (request, response, next) => {
    fetchArticles()
    .then((articles) => {
        response.status(200).send({ articles })
    })
    .catch((err) => {
        next(err)
    })
}

const getArticlesById = (request, response, next) => {
    fetchArticlesById(request.params.article_id)

    .then((article) => {
        response.status(200).send({ article })
    })
    .catch((err) => {
    next(err)
    })
}

const getArticleComments = (request, response, next) => {
    fetchArticleComments(request.params.article_id).then((comments) => {
        response.status(200).send({ comments })
    })
    .catch((err) => {
        next(err)
    })
}

module.exports = { getArticlesById , getArticles , getArticleComments }