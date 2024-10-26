const app = require("../app.js")
const port = 8080;
const listener = app.listen(port, (err) => {
    if (err) {
        console.log(err, "error!");
    } else {
        console.log(`listening on ${port}`)
    }
})

module.exports = { listener }