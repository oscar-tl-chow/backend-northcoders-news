const express = require("express");
const app = express()
const endpoints = require("./endpoints.json")
const { getTopics } = require("./controllers/topics.controller")
const { getArticlesById, getArticles, getArticleComments, postComment, updateVotes } = require("./controllers/articles.controller")

app.use(express.json())

app.get("/api/", (request, response) => {
    response.status(200).send({endpoints: endpoints})
});

app.get("/api/topics", getTopics)

app.get("/api/articles", getArticles)

app.get("/api/articles/:article_id", getArticlesById);

app.get("/api/articles/:article_id/comments", getArticleComments)

app.post("/api/articles/:article_id/comments", postComment)

app.patch("/api/articles/:article_id", updateVotes)

app.use((err, request, response, next) => {
    if(err.status && err.msg) {
        response.status(err.status).send({msg: err.msg})
    }
    next(err)
})

app.use((err, request, response, next) => {
    response.status(500).send({msg: "Internal Server Error"})
})

module.exports = app