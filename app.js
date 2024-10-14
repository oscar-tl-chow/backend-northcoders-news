const express = require("express");
const app = express()
const { getTopics } = require("./controllers/topics.controllers")

app.use(express.json())


app.get('/api/topics', getTopics);

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