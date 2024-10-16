const db = require("../db/connection")

const fetchTopics = () => {
    return db.query(`SELECT * FROM topics;`)
    .then((result) => {
        return result.rows
    })
}

module.exports = fetchTopics