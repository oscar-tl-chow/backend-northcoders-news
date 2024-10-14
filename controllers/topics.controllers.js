const fetchTopics = require("../models/topics.models")
const { request } = require("http")
const { response } = require("express")

const getTopics = (request, response, next) => {
    fetchTopics()
    .then((topics) => {
        response.status(200).send({ topics })
    })
    .catch((err) => {
        next(err)
    })
}

module.exports = { getTopics }