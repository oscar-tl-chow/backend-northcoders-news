const {
  fetchArticlesById,
  fetchArticles,
  fetchArticleComments,
  addComment,
  newArticleVotes,
  deleteComment,
} = require("../models/articles.model");

const getArticles = async (request, response, next) => {
  try {
    const { sort_by, order, topic } = request.query;
    const articles = await fetchArticles(sort_by, order, topic);
    response.status(200).send({ articles });
  } catch (err) {
    next(err);
  }
};

const getArticlesById = (request, response, next) => {
  fetchArticlesById(request.params.article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

const getArticleComments = (request, response, next) => {
  fetchArticleComments(request.params.article_id)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

const postComment = (request, response, next) => {
  const articleId = request.params.article_id;
  const comment = request.body;

  addComment(articleId, comment)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

const updateVotes = (request, response, next) => {
  const articleId = request.params.article_id;
  const newVotes = request.body.inc_votes;

  newArticleVotes(articleId, newVotes)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

const deleteCommentById = (request, response, next) => {
  const commentId = request.params.comment_id;

  deleteComment(commentId)
    .then(() => {
      response.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getArticlesById,
  getArticles,
  getArticleComments,
  postComment,
  updateVotes,
  deleteCommentById,
};
