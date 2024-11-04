const express = require("express");
const cors = require("cors");
const app = express();
const endpoints = require("./endpoints.json");
const { getTopics } = require("./controllers/topics.controller");
const {
  getArticlesById,
  getArticles,
  getArticleComments,
  postComment,
  updateVotes,
  deleteCommentById,
} = require("./controllers/articles.controller");
const { getUsers } = require("./controllers/users.controller");

app.use(cors());
app.use(express.json());

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", async (request, response, next) => {
  try {
    await getArticles(request, response, next);
  } catch (err) {
    console.error("Error in /api/articles route:", err);
    response.status(500).send({ msg: "Internal Server Error" });
  }
});

// app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticlesById);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", updateVotes);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/api/users", getUsers);

app.use((err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((request, response) => {
  response.status(404).send({ msg: "Route not found" });
});

app.use((err, request, response, next) => {
  response.status(500).send({ msg: err.msg || "Internal Server Error" });
});

module.exports = app;
