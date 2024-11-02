const db = require("../db/connection");
const { response } = require("../app");

const fetchArticlesById = (articleId) => {
  if (!Number(articleId)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: `no article found with ID ${articleId}`,
        });
      }
      return article; //return the article found
    });
};

const fetchArticles = () => {
  return db
    .query(
      `SELECT 
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
            ORDER BY ${sort_by} ${order};`
    )
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      next(err);
    });
};

const fetchArticleComments = (articleId) => {
  if (!Number(articleId)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(
      `SELECT
            comment_id,
            votes,
            created_at,
            author,
            body,
            article_id
            FROM comments WHERE article_id = $1
            ORDER BY created_at DESC;`,
      [articleId]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `no comments in article found with ID ${articleId}`,
        });
      }
      return result.rows;
    });
};

const addComment = (articleId, newComment) => {
  const { username, body } = newComment;
  if (!Number(articleId) || !newComment) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  if (!newComment.username || !newComment.body) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "no user exists" });
      }
      return db
        .query(`SELECT * FROM articles WHERE article_id = $1;`, [articleId])
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({
              status: 404,
              msg: `no comments in article found with ID ${articleId}`,
            });
          }
          //had to put the below db.query in the above return for it to work
          return db
            .query(
              `INSERT INTO comments (author, body, article_id)
            VALUES ($1, $2, $3) RETURNING *;`,
              [username, body, articleId]
            )
            .then(({ rows }) => {
              return rows[0];
            });
        });
    });
};

const newArticleVotes = (articleId, newVotes) => {
  if (!Number(articleId)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  if (!newVotes) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  if (!Number(newVotes)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(
      `UPDATE articles
                    SET votes = votes + $1
                    WHERE article_id = $2
                    RETURNING *;`,
      [newVotes, articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `no article found with ID ${articleId}`,
        });
      }
      return rows[0];
    });
};

const deleteComment = (commentId) => {
  if (!Number(commentId)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(
      `DELETE FROM comments WHERE comment_id = $1
                    RETURNING *;`,
      [commentId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `no comment found with ID ${commentId}`,
        });
      }
      const comment = rows[0];
      return comment;
    });
};

module.exports = {
  fetchArticlesById,
  fetchArticles,
  fetchArticleComments,
  addComment,
  newArticleVotes,
  deleteComment,
};
